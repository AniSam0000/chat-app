/* eslint-disable react-hooks/exhaustive-deps */

import { useContext, useEffect, useState, useRef } from "react";
import { ChatContext } from "./ChatContextProvider.js";
import { AuthContext } from "./AuthContextProvider.js";
import toast from "react-hot-toast";

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]); // This is your conversation list
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const { socket, axios } = useContext(AuthContext);

  // Use a ref to track the selected user inside the socket listener without causing re-renders
  const selectedUserRef = useRef(null);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Function to get all users for the sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error.message);
    }
  };

  // Function to get messages and mark the whole conversation as seen
  const getMessages = async (user) => {
    setLoading(true);
    try {
      // Step 1: Fetch the messages
      const { data: messagesData } = await axios.get(
        `/api/messages/${user._id}`
      );

      if (messagesData.success) {
        setMessages(messagesData.messages);

        // Step 2: Try to mark messages as seen in a separate try...catch
        try {
          await axios.put(`/api/messages/seen/${user._id}`);

          // Step 3: ONLY if the above call is successful, update the UI count
          setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
        } catch (seenError) {
          console.error("Failed to mark messages as seen:", seenError.message);
        }
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to send a message to the selected user
  const sendMessages = async (messageData) => {
    if (!selectedUser) return toast.error("No user selected");
    try {
      // ADD THIS LOG to see if the token is set in Axios
      // console.log(
      //   "Axios headers before sending:",
      //   axios.defaults.headers.common
      // );
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
        setUsers((prevUsers) => {
          const otherUsers = prevUsers.filter(
            (u) => u._id !== selectedUser._id
          );
          return [selectedUser, ...otherUsers];
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  const handleDelete = async (messageId) => {
    try {
      // Show a confirmation dialog to the user first
      if (window.confirm("Are you sure you want to delete this message?")) {
        const { data } = await axios.delete(`/api/messages/${messageId}`);

        if (data.success) {
          // Remove the message from your frontend state to update the UI
          setMessages((currentMessages) =>
            currentMessages.filter((msg) => msg._id !== messageId)
          );
          toast.success("Message deleted!");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message.");
    }
  };

  // A single, stable useEffect that sets up the socket listener ONCE
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      // LOG 1: See if the event is being received at all
      // console.log("Socket event 'newMessage' received:", newMessage);

      // ... (your logic to move the conversation to the top)

      // LOG 2: Check the condition for the open chat
      // //console.log(
      //   "Is chat open?",
      //   selectedUserRef.current &&
      //     newMessage.senderId === selectedUserRef.current._id
      // );
      //console.log("Current selected user:", selectedUserRef.current);
      //console.log("Message sender:", newMessage.senderId);

      if (
        selectedUserRef.current &&
        newMessage.senderId === selectedUserRef.current._id
      ) {
        //console.log("UPDATING MESSAGES for open chat."); // LOG 3
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/seen/${newMessage.senderId}`);
      } else {
        //console.log("Chat not open. Updating unseen count."); // LOG 4
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket]); // <-- Dependency array only contains 'socket'

  // ADD THIS useEffect TO AUTOMATICALLY FETCH MESSAGES
  useEffect(() => {
    // If a user is selected, call getMessages with that user object
    if (selectedUser) {
      getMessages(selectedUser);
    } else {
      // If no user is selected (e.g., deselected), clear the messages
      setMessages([]);
    }
  }, [selectedUser]); // This hook runs whenever 'selectedUser' changes
  const value = {
    messages,
    users,
    selectedUser,
    loading,
    getUsers,
    getMessages,
    sendMessages,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    handleDelete,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
