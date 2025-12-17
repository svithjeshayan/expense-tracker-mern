const cron = require('node-cron');
const RecurringExpense = require('../models/RecurringExpense');
const Expense = require('../models/Expense');

// Run every day at midnight
const startRecurringProcessor = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Processing recurring expenses...');
    
    try {
      const today = new Date();
      const currentDay = today.getDate();
      
      const recurring = await RecurringExpense.find({
        isActive: true,
        startDate: { $lte: today }
      });

      let processedCount = 0;

      for (const rec of recurring) {
        let shouldProcess = false;

        if (rec.frequency === 'monthly' && rec.dayOfMonth === currentDay) {
          const lastProcessedMonth = rec.lastProcessed 
            ? rec.lastProcessed.getMonth() 
            : -1;
          if (lastProcessedMonth !== today.getMonth()) {
            shouldProcess = true;
          }
        }

        if (shouldProcess) {
          const newExpense = new Expense({
            user: rec.user,
            amount: rec.amount,
            category: rec.category,
            description: rec.description,
            type: rec.type,
            date: today,
            paymentMethod: rec.paymentMethod
          });

          await newExpense.save();
          
          rec.lastProcessed = today;
          await rec.save();
          
          processedCount++;
        }
      }

      console.log(`✅ Processed ${processedCount} recurring expenses`);
    } catch (error) {
      console.error('❌ Error processing recurring expenses:', error);
    }
  });

  console.log('📅 Recurring expense processor started');
};

module.exports = { startRecurringProcessor };