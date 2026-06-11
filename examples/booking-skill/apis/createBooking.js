module.exports = async function createBooking(args) {
  return {
    content: [{ type: 'text', text: '预约已创建。请展示预约结果卡片。' }],
    structuredContent: { bookingId: 'book_001', status: 'confirmed', ...args },
    _meta: {}
  }
}
