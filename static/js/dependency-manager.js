

class DeepFXDependencyManager {
    constructor() {
        this.pollInterval = 2000; // Poll every 2 seconds
        this.statusEndpoint = '/core/environment-status/';
        this.taskEndpoint = '/core/task-status/';
        this.healthEndpoint = '/core/system-health/';
        
        this.currentTasks = new Map();
        this.notifications = new Map();
        
        this.init();
    }
    
    init() {
        this.createNotificationContainer();
        this.startPolling();
        this.setupEventListeners();
    }
    
    createNotificationContainer() {
        if (!document.getElementById('deepfx-notifications')) {
            const container = document.createElement('div');
            container.id = 'deepfx-notifications';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
    }
    
    async startPolling() {
        setInterval(async () => {
            await this.checkSystemHealth();
            await this.updateTaskStatuses();
        }, this.pollInterval);
        
        // Initial check
        await this.checkSystemHealth();
    }
    
    async checkSystemHealth() {
        try {
            const response = await fetch(this.healthEndpoint);
            const data = await response.json();
            
            if (data.success) {
                this.updateSystemStatus(data.data);
            }
        } catch (error) {
            console.error('Error checking system health:', error);
        }
    }
    
    updateSystemStatus(health) {
        const { environments, queue, system_ready } = health;
        
        // Update environment status indicators
        this.updateEnvironmentIndicators(environments);
        
        // Show notifications for environment changes
        Object.entries(environments.environments).forEach(([envType, env]) => {
            if (env.downloading && !this.notifications.has(`env-${envType}`)) {
                this.showNotification(
                    `env-${envType}`,
                    'info',
                    `Preparing ${envType} environment...`,
                    `Installing dependencies for ${envType}. This may take a few minutes.`,
                    false // Don't auto-dismiss
                );
            } else if (env.ready && this.notifications.has(`env-${envType}`)) {
                this.dismissNotification(`env-${envType}`);
                this.showNotification(
                    `env-${envType}-ready`,
                    'success',
                    `${envType} environment ready!`,
                    `You can now use ${envType} features.`,
                    true // Auto-dismiss
                );
            }
        });
    }
    
    updateEnvironmentIndicators(environments) {
        // Update any UI indicators showing environment status
        const indicators = document.querySelectorAll('[data-env-indicator]');
        indicators.forEach(indicator => {
            const envType = indicator.dataset.envIndicator;
            const env = environments.environments[envType];
            
            if (env) {
                indicator.className = env.ready ? 'env-ready' : 
                                   env.downloading ? 'env-preparing' : 'env-not-ready';
                indicator.title = env.ready ? 'Ready' :
                                env.downloading ? 'Preparing...' : 'Not Ready';
            }
        });
    }
    
    async updateTaskStatuses() {
        for (const [taskId, taskInfo] of this.currentTasks) {
            try {
                const response = await fetch(`${this.taskEndpoint}${taskId}/`);
                const data = await response.json();
                
                if (data.success) {
                    const status = data.data.status;
                    
                    if (status === 'completed') {
                        this.handleTaskCompleted(taskId, data.data);
                    } else if (status === 'failed') {
                        this.handleTaskFailed(taskId, data.data);
                    } else if (status === 'running') {
                        this.updateTaskProgress(taskId, 'running');
                    }
                }
            } catch (error) {
                console.error(`Error checking task ${taskId}:`, error);
            }
        }
    }
    
    addTask(taskId, taskType, message = null) {
        this.currentTasks.set(taskId, { type: taskType, startTime: Date.now() });
        
        const defaultMessage = `Your ${taskType} task has been queued and will start automatically.`;
        this.showNotification(
            `task-${taskId}`,
            'info',
            'Task Queued',
            message || defaultMessage,
            false
        );
    }
    
    handleTaskCompleted(taskId, taskData) {
        this.currentTasks.delete(taskId);
        this.dismissNotification(`task-${taskId}`);
        
        this.showNotification(
            `task-${taskId}-complete`,
            'success',
            'Task Completed!',
            `Your ${taskData.type} task has finished successfully.`,
            true
        );
        
        // Trigger any completion callbacks
        this.triggerTaskCompleteCallbacks(taskId, taskData);
    }
    
    handleTaskFailed(taskId, taskData) {
        this.currentTasks.delete(taskId);
        this.dismissNotification(`task-${taskId}`);
        
        this.showNotification(
            `task-${taskId}-failed`,
            'error',
            'Task Failed',
            `Your ${taskData.type} task failed: ${taskData.error}`,
            false
        );
    }
    
    updateTaskProgress(taskId, status) {
        const notification = document.getElementById(`notification-task-${taskId}`);
        if (notification) {
            const statusEl = notification.querySelector('.task-status');
            if (statusEl) {
                statusEl.textContent = status === 'running' ? 'Running...' : 'Queued';
                statusEl.className = `task-status ${status}`;
            }
        }
    }
    
    showNotification(id, type, title, message, autoDismiss = true) {
        this.dismissNotification(id); // Remove existing
        
        const notification = document.createElement('div');
        notification.id = `notification-${id}`;
        notification.className = `deepfx-notification ${type}`;
        notification.style.cssText = `
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 16px;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
            cursor: pointer;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <div style="font-weight: bold; margin-bottom: 4px;">${title}</div>
                    <div style="font-size: 14px; opacity: 0.9;">${message}</div>
                    ${id.startsWith('task-') && !id.includes('complete') && !id.includes('failed') ? 
                        '<div class="task-status queued" style="font-size: 12px; margin-top: 8px;">Queued</div>' : ''}
                </div>
                <button onclick="deepfxManager.dismissNotification('${id}')" 
                        style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; margin-left: 10px;">×</button>
            </div>
        `;
        
        notification.onclick = (e) => {
            if (e.target.tagName !== 'BUTTON') {
                this.dismissNotification(id);
            }
        };
        
        document.getElementById('deepfx-notifications').appendChild(notification);
        this.notifications.set(id, notification);
        
        if (autoDismiss) {
            setTimeout(() => this.dismissNotification(id), 5000);
        }
    }
    
    dismissNotification(id) {
        const notification = document.getElementById(`notification-${id}`);
        if (notification) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                notification.remove();
                this.notifications.delete(id);
            }, 300);
        }
    }
    
    getNotificationColor(type) {
        const colors = {
            'info': '#3498db',
            'success': '#27ae60',
            'warning': '#f39c12',
            'error': '#e74c3c'
        };
        return colors[type] || colors.info;
    }
    
    setupEventListeners() {
        // Add CSS animations
        if (!document.getElementById('deepfx-styles')) {
            const style = document.createElement('style');
            style.id = 'deepfx-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .env-ready { color: #27ae60; }
                .env-preparing { color: #f39c12; }
                .env-not-ready { color: #e74c3c; }
                .task-status.queued { color: #f39c12; }
                .task-status.running { color: #3498db; }
            `;
            document.head.appendChild(style);
        }
    }
    
    triggerTaskCompleteCallbacks(taskId, taskData) {
        // Trigger custom events for task completion
        const event = new CustomEvent('deepfx:taskComplete', {
            detail: { taskId, taskData }
        });
        document.dispatchEvent(event);
    }
}

// Initialize the manager
const deepfxManager = new DeepFXDependencyManager();

// Export for global access
window.deepfxManager = deepfxManager;