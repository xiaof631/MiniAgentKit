module.exports = async function searchServices() {
  return {
    content: [{ type: 'text', text: '已找到可预约服务。请展示服务列表，等待用户选择。' }],
    structuredContent: { services: [{ serviceId: 'svc_001', name: '颈部理疗体验', duration: 30 }] },
    _meta: {}
  }
}
