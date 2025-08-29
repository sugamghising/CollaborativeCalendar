import axios from "axios";
const API_BASE_URL = 'http://localhost:5000/api';

export const getUserInvites = async (token:string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/invites`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      maxBodyLength: Infinity,
    });
    return response.data; // clean data return
  } catch (error) {
    console.error("Error fetching invites:");
    throw error;
  }
};

export const acceptInviteToTeam = async (teamId: string | number, token: string) => {
  try {
    console.log("->>>>>>>>>>>>")
    console.log(teamId,token)
    const response = await axios.post(
      `${API_BASE_URL}/user/acceptInviteToTeam`,
      { teamId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error accepting invite:", error.response?.data || error.message);
    throw error;
  }
}
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
    console.error("Error creating team:",);
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

