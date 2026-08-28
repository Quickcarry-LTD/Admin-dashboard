// ===============================================
// File: mockData.ts
//
// Purpose:
// Mock data for the Admin Dashboard, matching the values shown in
// the approved Figma exactly, used until the backend's Admin
// Service and Analytics Service endpoints are connected.
// ===============================================

export const mockAdmin = {
  name: "Admin",
  role: "Super Admin",
};

export const mockOverviewStats = {
  totalOrders: { value: 1248, changePercent: 12.5 },
  completedOrders: { value: 982, changePercent: 14.3 },
  activeRiders: { value: 156, changePercent: 8.7 },
  totalCustomers: { value: 2846, changePercent: 10.2 },
  totalEarnings: { value: 2340800, changePercent: 18.7 },
};

export const mockOrdersOverview = [
  { day: "Mon", total: 210, completed: 150, pending: 40, cancelled: 20 },
  { day: "Tue", total: 260, completed: 190, pending: 50, cancelled: 20 },
  { day: "Wed", total: 230, completed: 170, pending: 40, cancelled: 20 },
  { day: "Thu", total: 300, completed: 220, pending: 55, cancelled: 25 },
  { day: "Fri", total: 340, completed: 260, pending: 60, cancelled: 20 },
  { day: "Sat", total: 280, completed: 210, pending: 45, cancelled: 25 },
  { day: "Sun", total: 250, completed: 190, pending: 40, cancelled: 20 },
];

export const mockOrdersByStatus = [
  { status: "Completed", value: 982, percent: 78.7, color: "#1B7A4C" },
  { status: "In Transit", value: 156, percent: 12.5, color: "#2F80ED" },
  { status: "Pending", value: 78, percent: 6.3, color: "#F5A623" },
  { status: "Cancelled", value: 32, percent: 2.5, color: "#E0453A" },
];

export const mockRecentOrders = [
  { id: "QCRY-78291", route: "Lagos → Ibadan", status: "Delivered", amount: 2450, time: "10:30 AM" },
  { id: "QCRY-78290", route: "Abuja → Kaduna", status: "In Transit", amount: 3200, time: "09:15 AM" },
  { id: "QCRY-78289", route: "PHC → Enugu", status: "Pending", amount: 2800, time: "08:45 AM" },
  { id: "QCRY-78288", route: "Lagos → Warri", status: "Delivered", amount: 2100, time: "Yesterday" },
  { id: "QCRY-78287", route: "Kano → Sokoto", status: "Cancelled", amount: 1500, time: "Yesterday" },
];

export const mockTopRiders = [
  { name: "Abdullahi Musa", completedOrders: 142, completionRate: 98, earnings: 284500 },
  { name: "Ibrahim Ali", completedOrders: 128, completionRate: 96, earnings: 256800 },
  { name: "Chinedu Okafor", completedOrders: 115, completionRate: 94, earnings: 230750 },
  { name: "Joseph Emmanuel", completedOrders: 104, completionRate: 93, earnings: 208300 },
  { name: "Aminu Garba", completedOrders: 98, completionRate: 91, earnings: 196400 },
];

export const mockRecentCustomers = [
  { name: "Mary Johnson", email: "mary.johnson@email.com", time: "Today, 10:20 AM" },
  { name: "Samuel Peter", email: "samuel.peter@email.com", time: "Today, 09:45 AM" },
  { name: "Blessing Adamu", email: "blessing.adamu@email.com", time: "Today, 09:30 AM" },
  { name: "Emeka Daniels", email: "emeka.daniels@email.com", time: "Today, 08:50 AM" },
  { name: "Fatima Hassan", email: "fatima.hassan@email.com", time: "Today, 08:15 AM" },
];

export const mockEarningsOverview = [
  { day: "Mon", amount: 280000 },
  { day: "Tue", amount: 340000 },
  { day: "Wed", amount: 300000 },
  { day: "Thu", amount: 420000 },
  { day: "Fri", amount: 480000 },
  { day: "Sat", amount: 390000 },
  { day: "Sun", amount: 330000 },
];

// Full order list used by the Orders page (superset of mockRecentOrders)
export const mockAllOrders = [
  ...mockRecentOrders,
  { id: "QCRY-78286", route: "Ibadan → Lagos", status: "Delivered", amount: 2900, time: "2 days ago" },
  { id: "QCRY-78285", route: "Enugu → Onitsha", status: "In Transit", amount: 1950, time: "2 days ago" },
  { id: "QCRY-78284", route: "Lagos → Ijebu-Ode", status: "Delivered", amount: 2200, time: "3 days ago" },
  { id: "QCRY-78283", route: "Kaduna → Zaria", status: "Pending", amount: 1750, time: "3 days ago" },
  { id: "QCRY-78282", route: "Abuja → Minna", status: "Cancelled", amount: 2600, time: "4 days ago" },
];

export const mockAllRiders = [
  { name: "Abdullahi Musa", id: "RID12345", phone: "+234 803 000 0001", status: "Online", completedOrders: 142, rating: 4.8, earnings: 284500 },
  { name: "Ibrahim Ali", id: "RID12346", phone: "+234 803 000 0002", status: "Online", completedOrders: 128, rating: 4.7, earnings: 256800 },
  { name: "Chinedu Okafor", id: "RID12347", phone: "+234 803 000 0003", status: "Offline", completedOrders: 115, rating: 4.6, earnings: 230750 },
  { name: "Joseph Emmanuel", id: "RID12348", phone: "+234 803 000 0004", status: "Online", completedOrders: 104, rating: 4.5, earnings: 208300 },
  { name: "Aminu Garba", id: "RID12349", phone: "+234 803 000 0005", status: "Offline", completedOrders: 98, rating: 4.4, earnings: 196400 },
];

export const mockAllCustomers = [
  { name: "Mary Johnson", email: "mary.johnson@email.com", phone: "+234 801 111 0001", totalOrders: 24, joined: "Jan 2025" },
  { name: "Samuel Peter", email: "samuel.peter@email.com", phone: "+234 801 111 0002", totalOrders: 18, joined: "Feb 2025" },
  { name: "Blessing Adamu", email: "blessing.adamu@email.com", phone: "+234 801 111 0003", totalOrders: 31, joined: "Nov 2024" },
  { name: "Emeka Daniels", email: "emeka.daniels@email.com", phone: "+234 801 111 0004", totalOrders: 9, joined: "Mar 2025" },
  { name: "Fatima Hassan", email: "fatima.hassan@email.com", phone: "+234 801 111 0005", totalOrders: 15, joined: "Dec 2024" },
];
