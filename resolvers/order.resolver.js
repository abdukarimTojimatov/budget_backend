import Order from '../models/order.model.js';
import mongoose from 'mongoose';

const orderResolver = {
  Query: {
    getOrders: async (
      _,
      { page, limit, orderCategory, orderStatus, orderType, orderPaymentStatus }
    ) => {
      try {
        const query = {};
        if (orderCategory) query.orderCategory = orderCategory;
        if (orderStatus) query.orderStatus = orderStatus;
        if (orderType) query.orderType = orderType;
        if (orderPaymentStatus) query.orderPaymentStatus = orderPaymentStatus;
        console.log('query', query);
        const options = {
          page,
          limit,
        };
        const result = await Order.paginate(query, options);
        return result; // Ensure this returns the correct paginated structure
      } catch (error) {
        console.error('Error fetching orders:', error);
        throw new Error('Error fetching orders: ' + error.message);
      }
    },
    getOrder: async (_, { id }) => {
      try {
        console.log('orderId', id);
        const order = await Order.findById(id);
        if (!order) {
          throw new Error('not found order');
        }
        return order;
      } catch (err) {
        console.error('Error getting order:', err);
        throw new Error('Error getting order');
      }
    },
    orderStatistics: async () => {
      try {
        const result = await Order.aggregate([
          {
            $group: {
              _id: '$orderCategory',
              orderTotalAmount: { $sum: '$orderTotalAmount' },
            },
          },
          {
            $project: {
              _id: 0,
              orderCategory: '$_id',
              orderTotalAmount: 1,
            },
          },
        ]);
        return result;
      } catch (error) {
        console.error('Error fetching order statistics:', error);
        throw new Error('Error fetching order statistics: ' + error.message);
      }
    },
  },
  Mutation: {
    //
    createOrder: async (_, { input }, context) => {
      try {
        if (!context.getUser()) throw new Error('Unauthorized');
        console.log('input', input);
        const newOrder = new Order({
          ...input,
          userId: context.getUser()._id,
        });

        await newOrder.save();

        return newOrder;
      } catch (err) {
        console.error('Error creating order:', err);
        throw new Error('Error crea');
      }
    },
    //
    updateOrder: async (_, { input }) => {
      try {
        console.log('input', input);
        const { _id, ...updateData } = input;

        // Fetch the existing order
        let order = await Order.findById(_id);
        if (!order) {
          throw new Error('Order not found');
        }

        // Update fields that are directly provided (except orderPayments for now)
        Object.keys(updateData).forEach((key) => {
          if (updateData[key] !== undefined && key !== 'orderPayments') {
            order[key] = updateData[key];
          }
        });

        // Handle orderPayments update:
        if (updateData.orderPayments) {
          // If the client provides orderPayments, you can choose to:
          // Option 1: Replace the existing payments array:
          order.orderPayments = updateData.orderPayments;

          // Option 2: If you intend to only add new payments, you might merge:
          // order.orderPayments = order.orderPayments.concat(updateData.orderPayments);
        }

        // Recalculate total paid from the payments array.
        order.orderTotalPaid = order.orderPayments.reduce(
          (sum, payment) => sum + (payment.amount || 0),
          0
        );

        // Recalculate debt as the difference between the total amount and the total paid.
        order.orderTotalDebt = order.orderTotalAmount - order.orderTotalPaid;

        // Update payment status based on the total paid vs. total amount.
        if (order.orderTotalPaid === 0) {
          order.orderPaymentStatus = 'tolanmadi';
        } else if (order.orderTotalPaid < order.orderTotalAmount) {
          order.orderPaymentStatus = 'qismanTolandi';
        } else {
          order.orderPaymentStatus = 'tolandi';
        }

        // Save the updated order.
        const updatedOrder = await order.save();
        return updatedOrder;
      } catch (err) {
        console.error('Error updating order:', err);
        throw new Error('Error updating order');
      }
    },

    //
    deleteOrder: async (_, { id }) => {
      try {
        const deletedOrder = await Order.findByIdAndDelete(id);

        return deletedOrder;
      } catch (err) {
        console.error('Error on deleting order:', err);
        throw new Error('Error deleting order');
      }
    },
  },
};

export default orderResolver;
