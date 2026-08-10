import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

const PeerInterviewPage = () => {
  // ------------------------------------
  // State
  // ------------------------------------
  const [roomCode, setRoomCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [connected, setConnected] = useState(false);

  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);

  const [error, setError] = useState("");

  // ------------------------------------
  // Refs
  // ------------------------------------
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  const roomCodeRef = useRef("");

  // Keep latest room code available to socket callbacks
  useEffect(() => {
    roomCodeRef.current = roomCode;
  }, [roomCode]);

  // ------------------------------------
  // Attach local stream after video renders
  // ------------------------------------
  useEffect(() => {
    if (joined && localVideoRef.current && localStreamRef.current) {
      console.log("🎥 Attaching local video stream");

      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [joined]);

  // ------------------------------------
  // Create Peer Connection
  // ------------------------------------
  const createPeerConnection = async () => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    peerConnectionRef.current = peerConnection;

    // ------------------------------------
    // Get camera + microphone
    // ------------------------------------
    if (!localStreamRef.current) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;

      console.log("🎥 Local media stream created");

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    }

    // ------------------------------------
    // Add local tracks
    // ------------------------------------
    localStreamRef.current.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStreamRef.current);
    });

    // ------------------------------------
    // Receive remote stream
    // ------------------------------------
    peerConnection.ontrack = (event) => {
      console.log("🎥 Remote stream received");

      const [remoteStream] = event.streams;

      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;

        remoteVideoRef.current.play().catch(() => {});
      }
    };

    // ------------------------------------
    // ICE candidates
    // ------------------------------------
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("webrtc_ice_candidate", {
          roomCode: roomCodeRef.current,
          candidate: event.candidate,
        });
      }
    };

    // ------------------------------------
    // Connection state
    // ------------------------------------
    peerConnection.onconnectionstatechange = () => {
      console.log("WebRTC:", peerConnection.connectionState);
    };

    return peerConnection;
  };

  // ------------------------------------
  // Create Offer
  // ------------------------------------
  const createOffer = async () => {
    try {
      console.log("📤 Creating WebRTC offer");

      const peerConnection = await createPeerConnection();

      const offer = await peerConnection.createOffer();

      await peerConnection.setLocalDescription(offer);

      socketRef.current.emit("webrtc_offer", {
        roomCode: roomCodeRef.current,
        offer,
      });

      console.log("📤 WebRTC offer sent");
    } catch (error) {
      console.error("❌ Offer creation error:", error);

      setError("Unable to create video connection");
    }
  };

  // ------------------------------------
  // Socket.IO
  // ------------------------------------
  useEffect(() => {
    console.log("🔌 Initializing Socket.IO");

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    // ------------------------------------
    // Connected
    // ------------------------------------
    socket.on("connect", () => {
      console.log("🔌 Socket connected:", socket.id);

      setConnected(true);
    });

    // ------------------------------------
    // Disconnected
    // ------------------------------------
    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");

      setConnected(false);
    });

    // ------------------------------------
    // Socket error
    // ------------------------------------
    socket.on("socket_error", (data) => {
      console.error("❌ Socket error:", data);

      setError(data.message);
    });

    // ------------------------------------
    // Room joined
    // ------------------------------------
    socket.on("room_joined", (data) => {
      console.log("✅ Room joined:", data);

      setJoined(true);
    });

    // ------------------------------------
    // Another participant joined
    // ------------------------------------
    socket.on("participant_joined", async () => {
      console.log("👤 Participant joined");

      // Give the other browser a moment
      // to finish creating its connection.
      await new Promise((resolve) => setTimeout(resolve, 500));

      await createOffer();
    });

    // ------------------------------------
    // Receive Offer
    // ------------------------------------
    socket.on("webrtc_offer", async ({ offer }) => {
      try {
        console.log("📨 WebRTC offer received");

        const peerConnection = await createPeerConnection();

        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer),
        );

        const answer = await peerConnection.createAnswer();

        await peerConnection.setLocalDescription(answer);

        socket.emit("webrtc_answer", {
          roomCode: roomCodeRef.current,
          answer,
        });

        console.log("📤 WebRTC answer sent");
      } catch (error) {
        console.error("❌ Offer handling error:", error);
      }
    });

    // ------------------------------------
    // Receive Answer
    // ------------------------------------
    socket.on("webrtc_answer", async ({ answer }) => {
      try {
        console.log("📨 WebRTC answer received");

        if (!peerConnectionRef.current) {
          return;
        }

        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer),
        );

        console.log("✅ Remote description set");
      } catch (error) {
        console.error("❌ Answer handling error:", error);
      }
    });

    // ------------------------------------
    // ICE Candidate
    // ------------------------------------
    socket.on("webrtc_ice_candidate", async ({ candidate }) => {
      try {
        if (peerConnectionRef.current && candidate) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate),
          );

          console.log("🧊 ICE candidate added");
        }
      } catch (error) {
        console.error("❌ ICE candidate error:", error);
      }
    });

    // ------------------------------------
    // Participant left
    // ------------------------------------
    socket.on("participant_left", () => {
      console.log("👋 Participant left");

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    });

    // ------------------------------------
    // Room started
    // ------------------------------------
    socket.on("room_started", () => {
      console.log("🚀 Room started");
    });

    // ------------------------------------
    // Room completed
    // ------------------------------------
    socket.on("room_completed", () => {
      console.log("🏁 Room completed");
    });

    // ------------------------------------
    // Cleanup
    // ------------------------------------
    return () => {
      console.log("🧹 Cleaning Socket.IO");

      socket.disconnect();

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());

        localStreamRef.current = null;
      }

      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());

        screenStreamRef.current = null;
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();

        peerConnectionRef.current = null;
      }
    };
  }, []);

  // ------------------------------------
  // Join Room
  // ------------------------------------
  const joinRoom = async () => {
    const code = roomCode.trim().toUpperCase();

    console.log("=================================");

    console.log("🚀 JOIN ROOM CLICKED");

    console.log("Room Code:", code);

    console.log("Socket:", socketRef.current);

    console.log("Connected:", socketRef.current?.connected);

    console.log("=================================");

    if (!code) {
      setError("Enter room code");

      return;
    }

    if (!socketRef.current) {
      setError("Socket is not initialized");

      return;
    }

    if (!socketRef.current.connected) {
      setError("Socket is not connected");

      return;
    }

    setError("");

    try {
      roomCodeRef.current = code;

      setRoomCode(code);

      // Get camera + microphone
      await createPeerConnection();

      console.log("🎥 Camera/microphone ready");

      // Join Socket.IO room
      socketRef.current.emit("join_room", {
        roomCode: code,
      });

      console.log("📤 join_room event sent:", code);
    } catch (error) {
      console.error("❌ Join room error:", error);

      setError("Camera or microphone permission is required");
    }
  };

  // ------------------------------------
  // Toggle microphone
  // ------------------------------------
  const toggleMicrophone = () => {
    if (!localStreamRef.current) {
      return;
    }

    const audioTrack = localStreamRef.current.getAudioTracks()[0];

    if (!audioTrack) {
      return;
    }

    audioTrack.enabled = !audioTrack.enabled;

    setMicEnabled(audioTrack.enabled);
  };

  // ------------------------------------
  // Toggle camera
  // ------------------------------------
  const toggleCamera = () => {
    if (!localStreamRef.current) {
      return;
    }

    const videoTrack = localStreamRef.current.getVideoTracks()[0];

    if (!videoTrack) {
      return;
    }

    videoTrack.enabled = !videoTrack.enabled;

    setCameraEnabled(videoTrack.enabled);
  };

  // ------------------------------------
  // Screen sharing
  // ------------------------------------
  const toggleScreenShare = async () => {
    if (!peerConnectionRef.current) {
      return;
    }

    if (!screenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

        screenStreamRef.current = stream;

        const screenTrack = stream.getVideoTracks()[0];

        const sender = peerConnectionRef.current
          .getSenders()
          .find((sender) => sender.track?.kind === "video");

        if (sender) {
          await sender.replaceTrack(screenTrack);
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        setScreenSharing(true);

        screenTrack.onended = () => {
          stopScreenShare();
        };
      } catch (error) {
        console.error("❌ Screen sharing error:", error);
      }
    } else {
      stopScreenShare();
    }
  };

  // ------------------------------------
  // Stop screen sharing
  // ------------------------------------
  const stopScreenShare = async () => {
    const cameraTrack = localStreamRef.current?.getVideoTracks()[0];

    const sender = peerConnectionRef.current
      ?.getSenders()
      .find((sender) => sender.track?.kind === "video");

    if (sender && cameraTrack) {
      await sender.replaceTrack(cameraTrack);
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());

      screenStreamRef.current = null;
    }

    setScreenSharing(false);
  };

  // ------------------------------------
  // Leave Room
  // ------------------------------------
  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());

      localStreamRef.current = null;
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());

      screenStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();

      peerConnectionRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setJoined(false);
    setScreenSharing(false);
    setConnected(false);
  };

  // ------------------------------------
  // UI
  // ------------------------------------
  return (
    <div
      style={{
        padding: "30px",
      }}
    >
      <h1>🎥 Peer Mock Interview</h1>

      <p>Socket: {connected ? "🟢 Connected" : "🔴 Disconnected"}</p>

      {!joined && (
        <div>
          <input
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="Enter room code"
          />

          <button onClick={joinRoom}>Join Room</button>
        </div>
      )}

      {error && (
        <p
          style={{
            color: "red",
          }}
        >
          {error}
        </p>
      )}

      {joined && (
        <>
          <h2>Room: {roomCode}</h2>

          <div
            style={{
              display: "flex",
              gap: "20px",
            }}
          >
            {/* Local */}
            <div>
              <h3>You</h3>

              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                style={{
                  width: "400px",
                  height: "300px",
                  background: "#000",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            </div>

            {/* Remote */}
            <div>
              <h3>Other Participant</h3>

              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={{
                  width: "400px",
                  height: "300px",
                  background: "#000",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <button onClick={toggleMicrophone}>
              {micEnabled ? "🎤 Mute" : "🔇 Unmute"}
            </button>

            <button onClick={toggleCamera}>
              {cameraEnabled ? "🎥 Turn Camera Off" : "📷 Turn Camera On"}
            </button>

            <button onClick={toggleScreenShare}>
              {screenSharing ? "🛑 Stop Sharing" : "📺 Share Screen"}
            </button>

            <button
              onClick={leaveRoom}
              style={{
                color: "red",
              }}
            >
              🚪 Leave Room
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PeerInterviewPage;
