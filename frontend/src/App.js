import React, { useRef, useState } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://192.168.1.9:3001");

function App() {
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [message, setMessage] = useState("");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);

  const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  const toggleAudio = () => {
    if (!localStream.current) return;
    localStream.current.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setAudioOn(prev => !prev);
  };

  const toggleVideo = () => {
    if (!localStream.current) return;
    localStream.current.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setVideoOn(prev => !prev);
  };

  const joinRoom = async () => {
    if (!roomId.trim()) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Browser does not support media devices.");
      return;
    }

    try {
      setJoined(true);
      socket.emit("join", roomId);

      localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = localStream.current;

      socket.on("ready", async () => {
        setMessage("Another user has joined the room.");
        peerConnection.current = createPeerConnection();
        localStream.current.getTracks().forEach(track =>
          peerConnection.current.addTrack(track, localStream.current)
        );
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socket.emit("offer", offer, roomId);
      });

      socket.on("offer", async (offer) => {
        peerConnection.current = createPeerConnection();
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        localStream.current.getTracks().forEach(track =>
          peerConnection.current.addTrack(track, localStream.current)
        );
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit("answer", answer, roomId);
      });

      socket.on("answer", answer =>
        peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer))
      );

      socket.on("ice-candidate", candidate =>
        peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
      );
    } catch (error) {
      console.error(error);
      alert("Permission denied or media devices error.");
    }
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(config);
    pc.onicecandidate = e => {
      if (e.candidate) {
        socket.emit("ice-candidate", e.candidate, roomId);
      }
    };
    pc.ontrack = e => {
      remoteVideoRef.current.srcObject = e.streams[0];
    };
    return pc;
  };

  return (
    <div className="container">
      <h2>Peer-to-Peer Video Chat</h2>
      {!joined ? (
        <div className="join-section">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button onClick={joinRoom}>Join</button>
        </div>
      ) : (
        <>
          {message && <p className="message">{message}</p>}
          <div className="video-grid">
            <video ref={localVideoRef} autoPlay muted playsInline></video>
            <video ref={remoteVideoRef} autoPlay playsInline></video>
          </div>
          <div className="control-panel">
            <button onClick={toggleAudio}>{audioOn ? "Mute Audio" : "Unmute Audio"}</button>
            <button onClick={toggleVideo}>{videoOn ? "Turn Off Video" : "Turn On Video"}</button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
