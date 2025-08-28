import axios from "axios";
import { log } from "console";

const api = (token:string) =>
  axios.create({
    baseURL: "http://localhost:5000", // or from env
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    maxBodyLength: Infinity,
  });

export const createTeam = async (token:string, teamName:string) => {
  try {
    const response = await api(token).post("/api/user/createTeam", {
      teamName,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating team:", error.message);
    throw error;
  }
};

export const getTeam = async (token: string) => {
  try {
    const response = await axios.get("http://localhost:5000/api/user/getTeam", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      maxBodyLength: Infinity,
    });
    // console.log("->>>>>>>>>>>>>>");
    
    // console.log(response);
    
    return response.data.team; // Adjust type if needed
  } catch (error: any) {
    console.error("Error fetching team:", error.message);
    throw error;
  }
};

const API_BASE = "http://localhost:5000/api"; // adjust if needed

// Invite team member
export const inviteTeamMember = async (token: string, email: string) => {
  try {
    const response = await axios.post(
      `${API_BASE}/user/inviteTeamMember`,
      { email }, // body
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error inviting team member:", error.response?.data || error);
    throw error;
  }
};

