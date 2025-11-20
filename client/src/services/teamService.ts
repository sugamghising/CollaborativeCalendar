import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL  ||
  "http://localhost:5000/api"; 
export const getUserInvites = async (token: string) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/user/invites`,   
      {
        headers: { Authorization: `Bearer ${token}` },
        maxBodyLength: Infinity,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching invites:");
    throw error;
  }
};

export const acceptInviteToTeam = async (
  teamId: string | number,
  token: string
) => {
  try {
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
    console.error(
      "Error accepting invite:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const api = (token: string) =>
  axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    maxBodyLength: Infinity,
  });

export const createTeam = async (token: string, teamName: string) => {
  try {
    const response = await api(token).post("/user/createTeam", {
      teamName,
    });
    console.log("Response create team",response,);

    
    return response.data;
  } catch (error) {
    console.error("Error creating team:");
    throw error;
  }
};

export const getTeam = async (token: string) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/user/getTeam`,   
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        maxBodyLength: Infinity,
      }
    );

    return response.data.team;
  } catch (error: any) {
    console.error("Error fetching team:", error.message);
    throw error;
  }
};

export const inviteTeamMember = async (token: string, email: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/user/inviteTeamMember`,  
      { email },
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
