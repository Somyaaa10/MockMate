import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Crown,
  X,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Play,
  CheckSquare,
  LogOut,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";
import { io } from "socket.io-client";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL, SOCKET_BASE_URL } from "../config/config";
import ThemeToggle from "../components/common/ThemeToggle";

function PeerInterviewRoom() {
  const { roomCode } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Helper to validate and sanitize display names (prevents undefined, null, [object Object])
  const getValidName = (name, fallback) => {
    if (!name || typeof name !== "string") return fallback;
    const trimmed = name.trim();
    if (
      !trimmed ||
      trimmed === "undefined" ||
      trimmed === "null" ||
      trimmed === "[object Object]"
    ) {
      return fallback;
    }
    return trimmed;
  };

  // Room & Peer State
  const [peerInterview, setPeerInterview] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [error, setError] = useState(null);
  const [mediaError, setMediaError] = useState(null);
  const [roomStatus, setRoomStatus] = useState("waiting");
  const [participantCount, setParticipantCount] = useState(1);
  const [peerConnected, setPeerConnected] = useState(false);
  const [remoteParticipant, setRemoteParticipant] = useState(null);

  // Controls State
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);

  // Local Stream State for React DOM binding
  const [localStream, setLocalStream] = useState(null);

  // Media & WebRTC Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]);
  const isCreatingOfferRef = useRef(false);

  const isHost =
    peerInterview?.host?._id?.toString() === user?._id?.toString() ||
    peerInterview?.host?.toString() === user?._id?.toString();

  const STUN_SERVERS = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ],
  };

  // -----------------------------------------------------------------
  // 1. GET USER MEDIA (CAMERA & MICROPHONE)
  // -----------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const acquireMedia = async () => {
      try {
        setMediaError(null);

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("INSECURE_OR_UNSUPPORTED");
        }

        console.log("[WEBRTC] Requesting camera and microphone access...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const videoTracks = stream.getVideoTracks();
        const audioTracks = stream.getAudioTracks();

        console.log("[WEBRTC] Local stream acquired");
        console.log(`[WEBRTC] Local video tracks: ${videoTracks.length}`);
        console.log(`[WEBRTC] Local audio tracks: ${audioTracks.length}`);

        localStreamRef.current = stream;
        setLocalStream(stream);

        // Attach tracks if peerConnection was created prior to getUserMedia completing
        if (peerConnectionRef.current) {
          const pc = peerConnectionRef.current;
          const senders = pc.getSenders();
          let addedAny = false;
          stream.getTracks().forEach((track) => {
            const alreadyAdded = senders.some((s) => s.track && s.track.kind === track.kind);
            if (!alreadyAdded) {
              pc.addTrack(track, stream);
              addedAny = true;
              console.log(`[WEBRTC] Added local ${track.kind} track to existing PC after getUserMedia`);
            }
          });
          if (addedAny && pc.signalingState === "stable" && socketRef.current) {
            console.log("[WEBRTC] Re-negotiating after adding media tracks to active PC");
            createWebRTCOffer(roomCode.trim().toUpperCase(), socketRef.current);
          }
        }
      } catch (err) {
        console.error("[WEBRTC] getUserMedia error:", err.name, err.message);

        let userMsg = "Camera/microphone access is required for a peer interview.";
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          userMsg = "Camera/microphone permission was denied. Please grant permission in browser address bar.";
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          userMsg = "No camera or microphone device was found on your device.";
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          userMsg = "Camera/microphone is already in use by another application.";
        } else if (err.message === "INSECURE_OR_UNSUPPORTED") {
          userMsg = "Media access requires a secure HTTPS context or localhost.";
        }

        if (isMounted) setMediaError(userMsg);
      }
    };

    acquireMedia();

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to wait for localStreamRef before offer/answer negotiation
  const waitForLocalStream = async (maxWaitMs = 5000) => {
    if (localStreamRef.current) return localStreamRef.current;
    console.log("[WEBRTC] Waiting for local media stream to resolve...");
    const start = Date.now();
    while (!localStreamRef.current && Date.now() - start < maxWaitMs) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return localStreamRef.current;
  };

  // -----------------------------------------------------------------
  // 2. ATTACH LOCAL & REMOTE STREAMS TO VIDEO DOM ELEMENTS
  // -----------------------------------------------------------------
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      console.log("[WEBRTC] Binding local stream to local video element");
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [localStream, loadingRoom]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStreamRef.current) {
      console.log("[WEBRTC] Binding remote stream to remote video element");
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
      remoteVideoRef.current.play().catch((e) => {
        console.warn("[WEBRTC] Remote video auto-play warning:", e.message);
      });
    }
  }, [peerConnected, loadingRoom]);

  // -----------------------------------------------------------------
  // 3. FETCH ROOM DETAILS & CONNECT SOCKET.IO SIGNALING
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!token || !roomCode) return;

    let isMounted = true;
    const cleanCode = roomCode.trim().toUpperCase();

    const initRoom = async () => {
      try {
        setLoadingRoom(true);
        setError(null);

        // Fetch Room Info via HTTP API
        const res = await axios.get(`${API_BASE_URL}/peer-interviews/${cleanCode}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data?.data;
        if (!data) throw new Error("Room not found");

        if (isMounted) {
          setPeerInterview(data);
          setRoomStatus(data.status);
          const initialCount = Math.min(Math.max(data.participants?.length || 1, 1), 2);
          setParticipantCount(initialCount);

          // Extract remote participant display name if present in HTTP response
          const currentIdStr = user?._id?.toString();
          if (currentIdStr) {
            let foundName = null;
            let foundId = null;

            const hostId = data.host?._id ? data.host._id.toString() : data.host?.toString();
            if (hostId && hostId !== currentIdStr) {
              foundId = hostId;
              foundName = data.host?.fullName || data.host?.name;
            } else if (Array.isArray(data.participants)) {
              for (const p of data.participants) {
                const pUser = p.user;
                if (!pUser) continue;
                const pId = pUser._id ? pUser._id.toString() : pUser.toString();
                if (pId && pId !== currentIdStr) {
                  foundId = pId;
                  foundName = pUser.fullName || pUser.name;
                  break;
                }
              }
            }

            if (foundId) {
              setRemoteParticipant({
                userId: foundId,
                displayName: getValidName(foundName, "Participant"),
              });
            }
          }
        }

        // Initialize Socket.IO connection
        const socket = io(SOCKET_BASE_URL, {
          auth: { token },
          transports: ["websocket", "polling"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
          const localName = user?.fullName || user?.name || user?.displayName || user?.username;
          console.log(`[SOCKET] Connected: socketId=${socket.id} userId=${user?._id}`);
          socket.emit("join_room", {
            roomCode: cleanCode,
            displayName: getValidName(localName, "You"),
          });
        });

        // Dedicated Named Event Handlers
        const handleRoomJoined = (payload) => {
          console.log("[SOCKET] room_joined payload:", payload);
          if (isMounted && payload?.status) {
            setRoomStatus(payload.status);
            const count = Math.min(Math.max(payload.participants || 1, 1), 2);
            setParticipantCount(count);
          }
        };

        const handleParticipantJoined = (payload) => {
          console.log(
            `[SOCKET] participant_joined: peerSocketId=${payload.socketId} peerUserId=${payload.userId} displayName=${payload.displayName}`
          );
          if (isMounted) {
            setParticipantCount(2);
            if (payload.userId && payload.userId.toString() !== user?._id?.toString()) {
              setRemoteParticipant({
                userId: payload.userId,
                socketId: payload.socketId,
                displayName: getValidName(payload.displayName, "Participant"),
              });
            }
          }

          // Initiator Rule: Existing room participant generates ONE offer when peer joins
          createWebRTCOffer(cleanCode, socket);
        };

        const handleWebRTCOfferEvent = async (payload) => {
          if (payload.senderSocketId && payload.senderSocketId === socket.id) return;
          console.log(
            `[WEBRTC] Offer received from senderSocketId=${payload.senderSocketId || "unknown"} senderUserId=${payload.senderUserId}`
          );
          if (isMounted && payload.senderUserId && payload.senderUserId.toString() !== user?._id?.toString()) {
            setParticipantCount(2);
            setRemoteParticipant((prev) => ({
              userId: payload.senderUserId,
              socketId: payload.senderSocketId || prev?.socketId,
              displayName: getValidName(payload.senderDisplayName, prev?.displayName || "Participant"),
            }));
          }
          if (payload.offer) {
            await handleWebRTCOffer(payload.offer, cleanCode, socket);
          }
        };

        const handleWebRTCAnswerEvent = async (payload) => {
          if (payload.senderSocketId && payload.senderSocketId === socket.id) return;
          console.log(
            `[WEBRTC] Answer received from senderSocketId=${payload.senderSocketId || "unknown"} senderUserId=${payload.senderUserId}`
          );
          if (isMounted && payload.senderUserId && payload.senderUserId.toString() !== user?._id?.toString()) {
            setParticipantCount(2);
            setRemoteParticipant((prev) => ({
              userId: payload.senderUserId,
              socketId: payload.senderSocketId || prev?.socketId,
              displayName: getValidName(payload.senderDisplayName, prev?.displayName || "Participant"),
            }));
          }
          if (payload.answer) {
            await handleWebRTCAnswer(payload.answer);
          }
        };

        const handleWebRTCIceCandidateEvent = async (payload) => {
          if (payload.senderSocketId && payload.senderSocketId === socket.id) return;
          if (payload.candidate) {
            console.log("[WEBRTC] ICE candidate received");
            await handleRemoteIceCandidate(payload.candidate);
          }
        };

        const handleRoomStarted = () => {
          console.log("[WEBRTC] room_started event received");
          if (isMounted) setRoomStatus("active");
        };

        const handleRoomCompleted = () => {
          console.log("[WEBRTC] room_completed event received");
          if (isMounted) setRoomStatus("completed");
        };

        const handleParticipantLeft = (payload) => {
          console.log("[WEBRTC] participant_left event received:", payload);
          if (isMounted) {
            setPeerConnected(false);
            setParticipantCount(1);
            setRemoteParticipant(null);
          }
          closePeerConnection();
        };

        const handleSocketError = (errData) => {
          console.error("[SOCKET] socket_error:", errData);
          if (isMounted && errData?.message) {
            setError(errData.message);
          }
        };

        // Attach listeners
        socket.on("room_joined", handleRoomJoined);
        socket.on("participant_joined", handleParticipantJoined);
        socket.on("webrtc_offer", handleWebRTCOfferEvent);
        socket.on("webrtc_answer", handleWebRTCAnswerEvent);
        socket.on("webrtc_ice_candidate", handleWebRTCIceCandidateEvent);
        socket.on("room_started", handleRoomStarted);
        socket.on("room_completed", handleRoomCompleted);
        socket.on("participant_left", handleParticipantLeft);
        socket.on("socket_error", handleSocketError);
      } catch (err) {
        const msg =
          err.response?.data?.message || "Failed to load peer room. Please try again.";
        if (isMounted) setError(msg);
      } finally {
        if (isMounted) setLoadingRoom(false);
      }
    };

    initRoom();

    return () => {
      isMounted = false;
      cleanupMediaAndSocket();
    };
  }, [token, roomCode]);

  // -----------------------------------------------------------------
  // 4. WEBRTC PEER CONNECTION CREATION & HELPERS
  // -----------------------------------------------------------------
  const createPeerConnection = (cleanCode, socket) => {
    if (peerConnectionRef.current) {
      console.log("[WEBRTC] Existing peer connection reused");
      if (localStreamRef.current) {
        const pc = peerConnectionRef.current;
        const senders = pc.getSenders();
        localStreamRef.current.getTracks().forEach((track) => {
          const alreadyAdded = senders.some((s) => s.track && s.track.kind === track.kind);
          if (!alreadyAdded) {
            pc.addTrack(track, localStreamRef.current);
            console.log(`[WEBRTC] Added missing local ${track.kind} track to existing PC`);
          }
        });
      }
      return peerConnectionRef.current;
    }

    console.log("[WEBRTC] Creating peer connection");
    const pc = new RTCPeerConnection(STUN_SERVERS);
    peerConnectionRef.current = pc;

    // Attach local media stream tracks to RTCPeerConnection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
        console.log(
          `[WEBRTC] Added local ${track.kind} track (enabled: ${track.enabled})`
        );
      });
    } else {
      console.warn("[WEBRTC] Local stream not ready when creating peer connection!");
    }

    // Handle incoming remote media stream tracks
    pc.ontrack = (event) => {
      console.log(
        `[WEBRTC ONTRACK] Remote ${event.track.kind} track received (id=${event.track.id}, readyState=${event.track.readyState})`
      );
      if (event.streams && event.streams[0]) {
        remoteStreamRef.current = event.streams[0];
      } else {
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
        }
        remoteStreamRef.current.addTrack(event.track);
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        remoteVideoRef.current.play().catch((e) => {
          console.warn("[WEBRTC ONTRACK] Remote video auto-play warning:", e.message);
        });
        console.log("[WEBRTC ONTRACK] Attached remoteStream to remote video element");
      }
      setPeerConnected(true);
    };

    // Relay local ICE Candidates via Socket.IO
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        console.log("[WEBRTC ICE] Candidate sent to remote peer");
        socket.emit("webrtc_ice_candidate", {
          roomCode: cleanCode,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(
        `[WEBRTC STATE] userId=${user?._id} connectionState=${pc.connectionState} iceConnectionState=${pc.iceConnectionState} signalingState=${pc.signalingState}`
      );
      if (pc.connectionState === "connected") {
        setPeerConnected(true);
      } else if (
        pc.connectionState === "failed" ||
        pc.connectionState === "closed"
      ) {
        setPeerConnected(false);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`[WEBRTC STATE] iceConnectionState changed: ${pc.iceConnectionState}`);
    };

    pc.onsignalingstatechange = () => {
      console.log(`[WEBRTC STATE] signalingState changed: ${pc.signalingState}`);
    };

    return pc;
  };

  // Create & Send SDP Offer (Initiator Only)
  const createWebRTCOffer = async (cleanCode, socket) => {
    if (isCreatingOfferRef.current) {
      console.log("[WEBRTC] Offer creation already in progress, skipping");
      return;
    }

    await waitForLocalStream();

    const existingPc = peerConnectionRef.current;
    if (existingPc && existingPc.signalingState !== "stable") {
      console.log(
        `[WEBRTC] Signaling state is ${existingPc.signalingState}, skipping offer creation`
      );
      return;
    }

    isCreatingOfferRef.current = true;

    try {
      console.log("[WEBRTC] Creating offer");
      const pc = createPeerConnection(cleanCode, socket);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      console.log("[WEBRTC] Sending ONE offer");
      socket.emit("webrtc_offer", {
        roomCode: cleanCode,
        offer,
      });
    } catch (err) {
      console.error("[WEBRTC] Create offer error:", err.message);
    } finally {
      isCreatingOfferRef.current = false;
    }
  };

  // Handle Received SDP Offer (Receiver)
  const handleWebRTCOffer = async (offer, cleanCode, socket) => {
    try {
      await waitForLocalStream();

      const pc = createPeerConnection(cleanCode, socket);
      if (pc.signalingState === "have-local-offer") {
        console.log("[WEBRTC] Offer collision detected (have-local-offer)");
        return;
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      console.log("[WEBRTC] Setting remote description");

      // Process any ICE candidates received prior to setting remote description
      await drainPendingIceCandidates(pc);

      console.log("[WEBRTC] Creating answer");
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log("[WEBRTC] Setting local description");

      console.log("[WEBRTC] Sending ONE answer");
      socket.emit("webrtc_answer", {
        roomCode: cleanCode,
        answer,
      });
    } catch (err) {
      console.error("[WEBRTC] Handle offer error:", err.message);
    }
  };

  // Handle Received SDP Answer (Initiator)
  const handleWebRTCAnswer = async (answer) => {
    try {
      const pc = peerConnectionRef.current;
      if (pc) {
        if (pc.signalingState !== "have-local-offer") {
          console.log(
            `[WEBRTC] Received answer while in signaling state: ${pc.signalingState}, ignoring`
          );
          return;
        }

        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("[WEBRTC] Setting remote description (answer)");
        await drainPendingIceCandidates(pc);
      }
    } catch (err) {
      console.error("[WEBRTC] Handle answer error:", err.message);
    }
  };

  // Handle Incoming Remote ICE Candidate (with Queue Guard)
  const handleRemoteIceCandidate = async (candidate) => {
    const pc = peerConnectionRef.current;
    if (pc && pc.remoteDescription && pc.remoteDescription.type) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("[WEBRTC] ICE candidate added");
      } catch (err) {
        console.error("[WEBRTC] Failed to add ICE candidate:", err.message);
      }
    } else {
      console.log("[WEBRTC] Queuing ICE candidate until remote description is set");
      pendingIceCandidatesRef.current.push(candidate);
    }
  };

  const drainPendingIceCandidates = async (pc) => {
    if (pendingIceCandidatesRef.current.length > 0 && pc.remoteDescription) {
      console.log(
        `[WEBRTC] Processing ${pendingIceCandidatesRef.current.length} queued ICE candidates`
      );
      while (pendingIceCandidatesRef.current.length > 0) {
        const candidate = pendingIceCandidatesRef.current.shift();
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("[WEBRTC] Queued ICE candidate added");
        } catch (err) {
          console.error("[WEBRTC] Failed adding queued candidate:", err.message);
        }
      }
    }
  };

  const closePeerConnection = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    pendingIceCandidatesRef.current = [];
  };

  const cleanupMediaAndSocket = () => {
    closePeerConnection();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  // -----------------------------------------------------------------
  // 5. MIC & CAMERA CONTROLS (MediaStreamTrack.enabled)
  // -----------------------------------------------------------------
  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !micEnabled;
      });
      setMicEnabled(!micEnabled);
    }
  };

  const toggleCam = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !camEnabled;
      });
      setCamEnabled(!camEnabled);
    }
  };

  // -----------------------------------------------------------------
  // 6. HOST & ROOM ACTIONS
  // -----------------------------------------------------------------
  const handleStartInterview = async () => {
    try {
      const cleanCode = roomCode.trim().toUpperCase();
      await axios.post(
        `${API_BASE_URL}/peer-interviews/start`,
        { roomCode: cleanCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRoomStatus("active");
      if (socketRef.current) {
        socketRef.current.emit("interview_started", { roomCode: cleanCode });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to start interview.");
    }
  };

  const handleCompleteInterview = async () => {
    try {
      const cleanCode = roomCode.trim().toUpperCase();
      await axios.post(
        `${API_BASE_URL}/peer-interviews/complete`,
        { roomCode: cleanCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRoomStatus("completed");
      if (socketRef.current) {
        socketRef.current.emit("interview_completed", { roomCode: cleanCode });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to complete interview.");
    }
  };

  const handleLeaveRoom = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to leave this peer interview room?"
    );
    if (!confirmed) return;

    try {
      const cleanCode = roomCode.trim().toUpperCase();
      await axios.post(
        `${API_BASE_URL}/peer-interviews/leave`,
        { roomCode: cleanCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (socketRef.current) {
        socketRef.current.emit("leave_room", { roomCode: cleanCode });
      }
    } catch (err) {
      console.error("Leave room API error:", err);
    } finally {
      cleanupMediaAndSocket();
      navigate("/peer/setup");
    }
  };

  if (loadingRoom) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-void)] text-[var(--text-primary-2)] p-6">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--text-primary-2)] mr-3" />
        <p className="text-sm font-semibold text-[var(--text-secondary-2)]">Loading peer room...</p>
      </div>
    );
  }

  if (error && !peerInterview) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-void)] p-6">
        <div className="w-full max-w-md rounded-2xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-8 text-center backdrop-blur-xl">
          <AlertCircle className="mx-auto h-10 w-10 text-[#EF4444] mb-3" />
          <h3 className="text-lg font-bold text-[var(--text-primary-2)]">Room Access Error</h3>
          <p className="mt-2 text-sm text-[#EF4444]">{error}</p>
          <button
            onClick={() => navigate("/peer/setup")}
            className="mt-6 rounded-xl border border-[var(--strong-line)] bg-[var(--bg-surface)] px-5 py-2.5 text-xs font-semibold text-[var(--text-primary-2)] hover:bg-[var(--hover-bg)]"
          >
            Return to Peer Setup
          </button>
        </div>
      </div>
    );
  }

  const displayStatus =
    roomStatus === "completed"
      ? "completed"
      : roomStatus === "active"
      ? "active"
      : participantCount >= 2
      ? "ready"
      : "waiting";

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[var(--bg-void)] text-[var(--text-primary-2)] selection:bg-[var(--inv-bg)] selection:text-[var(--inv-text)] flex flex-col justify-between">
      {/* Top Header */}
      <header className="shrink-0 border-b border-[var(--strong-line)] bg-[var(--bg-void)] z-30">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--strong-line)] bg-[var(--card-bg-2)]">
              <Crown className="h-4 w-4 text-[var(--text-primary-2)]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary-2)] leading-none">
                {peerInterview?.title || "Peer Mock Session"}
              </h2>
              <p className="text-xs font-mono text-[var(--text-secondary-2)] mt-1">
                Room: {roomCode?.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                displayStatus === "active"
                  ? "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30"
                  : displayStatus === "ready"
                  ? "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30"
                  : displayStatus === "completed"
                  ? "bg-[#A855F7]/10 text-[#A855F7] border border-[#A855F7]/30"
                  : "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30"
              }`}
            >
              Status: {displayStatus}
            </span>

            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[var(--strong-line)] bg-[var(--bg-surface)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary-2)]">
              <Users className="h-3.5 w-3.5" />
              {participantCount} / 2 Participants
            </span>
          </div>

          <button
            type="button"
            onClick={handleLeaveRoom}
            className="flex items-center gap-1.5 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-1.5 text-xs font-semibold text-[#EF4444] transition hover:bg-[#EF4444]/20"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Leave Room</span>
          </button>
        </div>
      </header>

      {/* Main Video Grid */}
      <main className="flex-1 min-h-0 mx-auto w-full max-w-7xl px-6 py-4 flex flex-col items-center justify-center overflow-hidden">
        {/* Media Error Alert Banner */}
        {mediaError && (
          <div className="mb-3 shrink-0 flex items-center justify-center gap-2 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 py-2.5 px-4 text-xs font-semibold text-[#EF4444]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{mediaError}</span>
          </div>
        )}

        <div className="relative w-full h-full max-h-full aspect-video overflow-hidden rounded-2xl border border-[var(--strong-line)] bg-[var(--card-bg-2)] shadow-2xl flex items-center justify-center">
          {/* Primary Canvas: Remote Peer Video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />

          {peerConnected && (
            <div className="absolute bottom-4 left-4 rounded-md bg-[rgba(0,0,0,0.80)] border border-[var(--strong-line)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary-2)]">
              {getValidName(remoteParticipant?.displayName, "Participant")}
            </div>
          )}

          {!peerConnected && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg-surface)]/90 text-center p-6 backdrop-blur-md">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--card-bg-2)] border border-[var(--strong-line)] text-[var(--text-primary-2)] mb-3">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary-2)]">
                {participantCount === 0
                  ? "Waiting for participants..."
                  : participantCount === 1
                  ? "Waiting for Peer..."
                  : "Ready to start"}
              </h3>
              <p className="mt-1 text-xs text-[var(--text-secondary-2)] max-w-sm">
                {participantCount >= 2
                  ? "Both participants are in the room. Establishing video connection..."
                  : `Share room code ${roomCode} with your partner to begin video call.`}
              </p>
            </div>
          )}

          {/* Secondary Floating Canvas: Local User Video */}
          <div className="absolute bottom-4 right-4 h-32 w-48 overflow-hidden rounded-xl border border-[var(--strong-line)] bg-[var(--bg-void)] shadow-2xl sm:h-40 sm:w-56">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-2 left-2 rounded-md bg-[rgba(0,0,0,0.80)] border border-[var(--strong-line)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary-2)]">
              {getValidName(user?.fullName || user?.name || user?.displayName || user?.username, "You")}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Floating Control Bar */}
      <footer className="shrink-0 border-t border-[var(--strong-line)] bg-[var(--bg-void)] py-3 z-30">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-4 px-6">
          {/* Mic Toggle */}
          <button
            type="button"
            onClick={toggleMic}
            className={`flex h-12 w-12 items-center justify-center rounded-xl border transition ${
              micEnabled
                ? "border-[var(--strong-line)] bg-[var(--card-bg-2)] text-[var(--text-primary-2)] hover:bg-[var(--hover-bg)]"
                : "border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444]"
            }`}
            title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>

          {/* Camera Toggle */}
          <button
            type="button"
            onClick={toggleCam}
            className={`flex h-12 w-12 items-center justify-center rounded-xl border transition ${
              camEnabled
                ? "border-[var(--strong-line)] bg-[var(--card-bg-2)] text-[var(--text-primary-2)] hover:bg-[var(--hover-bg)]"
                : "border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444]"
            }`}
            title={camEnabled ? "Turn Off Camera" : "Turn On Camera"}
          >
            {camEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>

          {/* Host Start Action */}
          {isHost && roomStatus === "waiting" && (
            <button
              type="button"
              onClick={handleStartInterview}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--inv-bg)] px-6 py-3 text-xs font-bold text-[var(--inv-text)] shadow-sm transition hover:bg-[var(--inv-hover)]"
            >
              <Play className="h-4 w-4" />
              Start Interview
            </button>
          )}

          {/* Host Complete Action */}
          {isHost && roomStatus === "active" && (
            <button
              type="button"
              onClick={handleCompleteInterview}
              className="inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-6 py-3 text-xs font-bold text-[var(--inv-text)] shadow-sm transition hover:bg-[#22C55E]/90"
            >
              <CheckSquare className="h-4 w-4" />
              Complete Interview
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

export default PeerInterviewRoom;
