import api from '../api/axios';

const QUEUE_KEY = 'offline_op_queue';

// Get current queue
const getQueue = () => {
  try {
    const queue = localStorage.getItem(QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error('Error reading offline queue:', error);
    return [];
  }
};

// Save queue
const saveQueue = (queue) => {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

// Add operation to queue
export const queueOperation = (type, data, tempId) => {
  const queue = getQueue();
  queue.push({
    id: Date.now().toString(),
    type, // 'ADD_EXPENSE', 'EDIT_EXPENSE', 'DELETE_EXPENSE'
    data,
    tempId, // ID used in UI while offline
    timestamp: Date.now()
  });
  saveQueue(queue);
};

// Process queue
export const processQueue = async () => {
  const queue = getQueue();
  if (queue.length === 0) return { success: true, count: 0 };

  console.log(`Processing ${queue.length} offline operations...`);
  const remainingQueue = [];
  let successCount = 0;

  for (const op of queue) {
    try {
      switch (op.type) {
        case 'ADD_EXPENSE':
          await api.post('/expenses', op.data);
          break;
        case 'EDIT_EXPENSE':
          await api.put(`/expenses/${op.data.id}`, op.data.updates);
          break;
        case 'DELETE_EXPENSE':
          await api.delete(`/expenses/${op.data.id}`);
          break;
        default:
          console.warn('Unknown operation type:', op.type);
      }
      successCount++;
    } catch (error) {
      console.error(`Failed to sync op ${op.id} (${op.type}):`, error);
      // Keep in queue if it's a network error (or 5xx), discard if 4xx client error?
      // For now, simple retry logic: keep in queue if not 400
      if (!error.response || error.response.status >= 500) {
        remainingQueue.push(op);
      }
    }
  }

  saveQueue(remainingQueue);
  return { success: true, count: successCount, remaining: remainingQueue.length };
};

// Check if queue has items
export const hasPendingOperations = () => {
  return getQueue().length > 0;
};
