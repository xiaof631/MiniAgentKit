module.exports = async function getAvailableSlots(args) {
  return {
    content: [{ type: 'text', text: '已找到可预约档期。请展示档期列表，等待用户选择。' }],
    structuredContent: { serviceId: args.serviceId, slots: [{ date: args.date || '2026-06-12', time: '15:00' }] },
    _meta: {}
  }
}
