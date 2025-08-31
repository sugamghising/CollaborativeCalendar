import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/schedule";

// your static token (later you can store in .env or localStorage)

export const createBlockedTime = async (blockedTimeData, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/createBlockedTime`,
      blockedTimeData,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating blocked time:", error);
    throw error;
  }
};

export const createUserSchedule = async (
  startTime: string,
  endTime: string,
  role: string,
  token: string
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/createuserschedule`,
      { startTime, endTime, role },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        maxBodyLength: Infinity,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error creating schedule:", error.response?.data || error);
    throw error;
  }
};


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
