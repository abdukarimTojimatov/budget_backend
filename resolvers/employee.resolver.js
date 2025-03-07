import Employee from '../models/employee.model.js';
import SalaryPayment from '../models/salary.model.js';
import Attendance from '../models/attendance.model.js';
import { GraphQLError } from 'graphql';

const employeeResolver = {
  Query: {
    employees: async () => {
      return await Employee.find().sort({ name: 1 });
    },
    employee: async (_, { id }) => {
      return await Employee.findById(id);
    },
    attendances: async (_, { date, startDate, endDate }) => {
      let query = {};
      
      if (date) {
        // For a specific date
        const specificDate = new Date(date);
        const nextDay = new Date(specificDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        query.date = {
          $gte: specificDate,
          $lt: nextDay,
        };
      } else if (startDate && endDate) {
        // For a date range
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
      
      return await Attendance.find(query)
        .populate('employee')
        .sort({ date: -1 });
    },
    employeeAttendances: async (_, { employeeId, startDate, endDate }) => {
      let query = { employee: employeeId };
      
      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
      
      return await Attendance.find(query)
        .populate('employee')
        .sort({ date: -1 });
    },
    salaryPayments: async (_, { startDate, endDate }) => {
      let query = {};

      if (startDate && endDate) {
        query.paymentDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      return await SalaryPayment.find(query)
        .populate('employee')
        .sort({ paymentDate: -1 });
    },
    employeeSalaryPayments: async (_, { employeeId, startDate, endDate }) => {
      let query = { employee: employeeId };

      if (startDate && endDate) {
        query.paymentDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      return await SalaryPayment.find(query)
        .populate('employee')
        .sort({ paymentDate: -1 });
    },
    employeeSalaryStats: async (_, { startDate, endDate }) => {
      let matchQuery = {};

      if (startDate && endDate) {
        matchQuery.paymentDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      // Aggregate salary statistics by employee
      const stats = await SalaryPayment.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$employee',
            totalPaid: { $sum: '$totalAmount' },
            totalAdvance: {
              $sum: {
                $cond: [{ $eq: ['$isAdvance', true] }, '$totalAmount', 0],
              },
            },
            totalRegularHours: { $sum: '$regularHours' },
            totalOvertimeHours: { $sum: '$overtimeHours' },
            paymentCount: { $sum: 1 },
          },
        },
      ]);

      // Populate employee data
      const result = await Promise.all(
        stats.map(async (stat) => {
          const employee = await Employee.findById(stat._id);
          return {
            employee,
            totalPaid: stat.totalPaid,
            totalAdvance: stat.totalAdvance,
            totalRegularHours: stat.totalRegularHours,
            totalOvertimeHours: stat.totalOvertimeHours,
            paymentCount: stat.paymentCount,
          };
        })
      );

      return result;
    },
    monthlySalaryStats: async (_, { year }) => {
      const currentYear = year || new Date().getFullYear();
      const startDate = new Date(currentYear, 0, 1); // January 1st of the specified year
      const endDate = new Date(currentYear, 11, 31); // December 31st of the specified year

      const stats = await SalaryPayment.aggregate([
        {
          $match: {
            paymentDate: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: '$paymentDate' },
              year: { $year: '$paymentDate' },
            },
            totalAmount: { $sum: '$totalAmount' },
          },
        },
        {
          $project: {
            _id: 0,
            month: '$_id.month',
            year: '$_id.year',
            totalAmount: 1,
          },
        },
        { $sort: { year: 1, month: 1 } },
      ]);

      // Convert month numbers to month names
      return stats.map((stat) => {
        const monthNames = [
          'Yanvar',
          'Fevral',
          'Mart',
          'Aprel',
          'May',
          'Iyun',
          'Iyul',
          'Avgust',
          'Sentabr',
          'Oktabr',
          'Noyabr',
          'Dekabr',
        ];
        return {
          ...stat,
          month: monthNames[stat.month - 1],
        };
      });
    },
  },
  Mutation: {
    createEmployee: async (_, { input }) => {
      const employee = new Employee(input);
      await employee.save();
      return employee;
    },
    createAttendance: async (_, { input }) => {
      const { employeeId, date, ...attendanceData } = input;
      
      // Find employee
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new GraphQLError('Ishchi topilmadi', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      
      // Check if attendance already exists for this employee on this date
      const existingAttendance = await Attendance.findOne({
        employee: employeeId,
        date: new Date(date),
      });
      
      if (existingAttendance) {
        throw new GraphQLError('Bu sana uchun davomat allaqachon kiritilgan', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      
      const attendance = new Attendance({
        ...attendanceData,
        employee: employeeId,
        date: new Date(date),
      });
      
      await attendance.save();
      attendance.employee = employee;
      
      return attendance;
    },
    updateAttendance: async (_, { id, input }) => {
      const { employeeId, date, ...attendanceData } = input;
      
      const attendance = await Attendance.findByIdAndUpdate(
        id,
        {
          ...attendanceData,
          employee: employeeId,
          date: new Date(date),
        },
        { new: true }
      ).populate('employee');
      
      if (!attendance) {
        throw new GraphQLError('Davomat topilmadi', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      
      return attendance;
    },
    deleteAttendance: async (_, { id }) => {
      const result = await Attendance.deleteOne({ _id: id });
      return result.deletedCount > 0;
    },
    bulkCreateAttendance: async (_, { inputs }) => {
      const attendances = [];
      
      for (const input of inputs) {
        const { employeeId, date, ...attendanceData } = input;
        
        // Find employee
        const employee = await Employee.findById(employeeId);
        if (!employee) {
          throw new GraphQLError(`Ishchi ID ${employeeId} topilmadi`, {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        
        // Check if attendance already exists for this employee on this date
        const existingAttendance = await Attendance.findOne({
          employee: employeeId,
          date: new Date(date),
        });
        
        // If attendance exists, update it, otherwise create new
        let attendance;
        if (existingAttendance) {
          attendance = await Attendance.findByIdAndUpdate(
            existingAttendance._id,
            {
              ...attendanceData,
              employee: employeeId,
              date: new Date(date),
            },
            { new: true }
          );
        } else {
          attendance = new Attendance({
            ...attendanceData,
            employee: employeeId,
            date: new Date(date),
          });
          await attendance.save();
        }
        
        attendance.employee = employee;
        attendances.push(attendance);
      }
      
      return attendances;
    },
    updateEmployee: async (_, { id, input }) => {
      const employee = await Employee.findByIdAndUpdate(id, input, {
        new: true,
      });
      if (!employee) {
        throw new GraphQLError('Ishchi topilmadi', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      return employee;
    },
    deleteEmployee: async (_, { id }) => {
      // Check if employee has salary payments
      const hasSalaryPayments = await SalaryPayment.exists({ employee: id });

      if (hasSalaryPayments) {
        throw new GraphQLError(
          "Bu ishchi uchun maosh to'lovlari mavjud. Avval to'lovlarni o'chirib tashlang.",
          { extensions: { code: 'BAD_USER_INPUT' } }
        );
      }

      const result = await Employee.deleteOne({ _id: id });
      return result.deletedCount > 0;
    },
    createSalaryPayment: async (_, { input }) => {
      const { employeeId, ...paymentData } = input;

      // Find employee and calculate total amount if not provided
      const employee = await Employee.findById(employeeId);

      if (!employee) {
        throw new GraphQLError('Ishchi topilmadi', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      const payment = new SalaryPayment({
        ...paymentData,
        employee: employeeId,
      });

      await payment.save();
      payment.employee = employee;

      return payment;
    },
    updateSalaryPayment: async (_, { id, input }) => {
      const { employeeId, ...paymentData } = input;

      const payment = await SalaryPayment.findByIdAndUpdate(
        id,
        {
          ...paymentData,
          employee: employeeId,
        },
        { new: true }
      ).populate('employee');

      if (!payment) {
        throw new GraphQLError("To'lov topilmadi", {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      return payment;
    },
    deleteSalaryPayment: async (_, { id }) => {
      const result = await SalaryPayment.deleteOne({ _id: id });
      return result.deletedCount > 0;
    },
  },
};

export default employeeResolver;
