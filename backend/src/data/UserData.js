// backend/src/data/userData.js
import User from './models/User.js';

const userData = {
    async create(data) {
        const user = new User(data);
        return await user.save();
    },

    async findByEmail(email) {
        return await User.findOne({ email });
    },
    async findByEmailWithPassword(email) {
    return await User.findOne({ email }).lean();
   },

    async findById(id) {
        return await User.findById(id);
    },
    async findByRole(role) {
    return await User.find({ role }).select('name email role').lean();
    },

    async getAll() {
        return await User.find();
    },

    async update(id, data) {
        return await User.findByIdAndUpdate(id, data, { new: true });
    },

    async delete(id) {
        return await User.findByIdAndDelete(id);
    }
};

export default userData;