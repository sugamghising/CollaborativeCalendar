import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/schedule";

// your static token (later you can store in .env or localStorage)

export const getIndividualSchedule = async (token:string) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/getIndividualSchedule`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        maxBodyLength: Infinity,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching schedule:", error);
    throw error;
  }
};
export const getBlockTime = async (token:string) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/getBlockedTimes`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        maxBodyLength: Infinity,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching schedule:", error);
    throw error;
  }
};
