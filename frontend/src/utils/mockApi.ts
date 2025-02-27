import dashboardData from "../../mocks/dashbord.json";
import eventsUpcomingData from "../../mocks/events-upcoming.json";
import eventsHistoryData from "../../mocks/events-history.json";
import goodsUpcomingData from "../../mocks/goods-upcoming.json";
import fansRegisterData from "../../mocks/fans-register.json";
import fansUserInfoData from "../../mocks/fans-user-info.json";
import userEventInfoData from "../../mocks/fans-user-event-info.json";

export const getDashboardData = async () => {
  return dashboardData;
};

export const getEventsUpcomingData = async () => {
  return eventsUpcomingData;
};

export const getEventsHistoryData = async () => {
  return eventsHistoryData;
};

export const getGoodsUpcomingData = async () => {
  return goodsUpcomingData;
};

export const registerFan = async () => {
  return fansRegisterData;
};

export const getUserInfo = async () => {
  return fansUserInfoData;
};

export const getUserEventInfo = async () => {
  return userEventInfoData;
};
