module.exports = {
    authConfigValid: {
        APP_LINK_PREFIX: 'blackstar://',
        BLACKSTAR_GATEWAY_HOST: 'https://api.blackmarket.coa',
        BLACKSTAR_GATEWAY_KEY: 'bs_live_12345678',
    },
    instanceLinkValid: {
        host: 'https://tenant.blackmarket.coa',
        key: 'tenant_key_12345',
        socketcluster_host: 'socket.blackmarket.coa',
        socketcluster_port: '8000',
        socketcluster_secure: 'true',
    },
    orderNotification: {
        payload: {
            id: 'order_123',
            type: 'order.updated',
            order_id: 'order_123',
        },
    },
    issueNotification: {
        payload: {
            id: 'issue_74',
            type: 'issue.updated',
            issue_id: 'issue_74',
        },
    },
    preAcceptancePayload: {
        order_id: 'order_123',
        task_ref: 'task_778',
        pickup_eta: '2026-03-17T13:45:00Z',
        dropoff_eta: '2026-03-17T14:20:00Z',
        pickup: { lat: 1.3521, lng: 103.8198 },
        dropoff: { lat: 1.2921, lng: 103.7764 },
        route: {
            full_route: true,
            polyline: 'encoded-route-data',
            topology: { graph_nodes: [1, 2], graph_edges: [[1, 2]] },
        },
    },
};
