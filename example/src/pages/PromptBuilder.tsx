import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ExpressionEditor } from 'react-dynamic-expression-editor';
import { ArrowLeft, ChevronDown, ChevronRight, GripVertical, Play, RotateCcw, Plus, Trash2 } from 'lucide-react';
import './PromptBuilder.css';

interface PromptMessage {
    id: string;
    role: 'system' | 'user' | 'assistant';
    label: string;
    content: string;
}

const ROLE_CONFIG = {
    system: { color: '#a78bfa', bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.2)', label: 'System' },
    user: { color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)', border: 'rgba(96, 165, 250, 0.2)', label: 'User' },
    assistant: { color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)', border: 'rgba(52, 211, 153, 0.2)', label: 'Assistant' },
};

export const PromptBuilder: React.FC = () => {
    const [messages, setMessages] = useState<PromptMessage[]>([
        {
            id: 'msg-1',
            role: 'system',
            label: 'System Prompt',
            content: 'You are a helpful customer support agent for {{variables.companyName}}. The current user is {{user.name}} ({{user.email}}) on the {{user.plan}} plan.\n\nKey guidelines:\n- Always address the user by their first name\n- Reference their support ticket {{variables.ticketId}} when applicable\n- Current workflow step: {{variables.workflow.step}}',
        },
        {
            id: 'msg-2',
            role: 'user',
            label: 'User Message Template',
            content: '{{message.content}}',
        },
        {
            id: 'msg-3',
            role: 'assistant',
            label: 'Response Template',
            content: 'Hello {{user.name}}! I see you\'re reaching out about your {{variables.workflow.name}}. Let me help you with that. Your current status is: {{variables.workflow.status}}.',
        },
    ]);

    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']));
    const [selectedPreset, setSelectedPreset] = useState<string>('customer-support');

    const contextData = useMemo(
        () => ({
            user: {
                name: 'Sarah Johnson',
                email: 'sarah.j@company.com',
                id: 'usr_12345',
                plan: 'premium',
                joinedAt: '2023-06-15',
                profile: {
                    company: 'TechCorp Inc',
                    role: 'Product Manager',
                    timezone: 'America/New_York',
                },
                preferences: {
                    notifications: {
                        email: true,
                        sms: false,
                        push: true,
                    },
                    language: 'en-US',
                },
            },
            message: {
                content: 'Can you help me reset my password?',
                role: 'user',
                timestamp: '2024-01-20T14:30:00Z',
                id: 'msg_abc123',
                metadata: {
                    language: 'en',
                    channel: 'web',
                    sentiment: 'neutral',
                },
            },
            conversation: {
                id: 'conv_789',
                messageCount: 5,
                topic: 'Account Support',
                history: [
                    { role: 'user', content: 'Hello', timestamp: '14:25:00' },
                    { role: 'assistant', content: 'Hi! How can I help?', timestamp: '14:25:02' },
                    { role: 'user', content: 'I need to reset my password', timestamp: '14:26:00' },
                ],
                tags: ['password', 'account', 'support'],
            },
            variables: {
                companyName: 'Acme Corp',
                supportEmail: 'support@acme.com',
                ticketId: 'TKT-4523',
                priority: 'high',
                workflow: {
                    name: 'Password Reset Flow',
                    step: 'verification',
                    status: 'in_progress',
                },
                model: 'gpt-4o',
                temperature: 0.7,
                maxTokens: 2048,
            },
        }),
        []
    );

    const presets = [
        {
            id: 'customer-support',
            label: 'Customer Support',
            messages: [
                {
                    id: 'msg-1',
                    role: 'system' as const,
                    label: 'System Prompt',
                    content: 'You are a helpful customer support agent for {{variables.companyName}}. The current user is {{user.name}} ({{user.email}}) on the {{user.plan}} plan.\n\nKey guidelines:\n- Always address the user by their first name\n- Reference their support ticket {{variables.ticketId}} when applicable\n- Current workflow step: {{variables.workflow.step}}',
                },
                {
                    id: 'msg-2',
                    role: 'user' as const,
                    label: 'User Message Template',
                    content: '{{message.content}}',
                },
                {
                    id: 'msg-3',
                    role: 'assistant' as const,
                    label: 'Response Template',
                    content: 'Hello {{user.name}}! I see you\'re reaching out about your {{variables.workflow.name}}. Let me help you with that. Your current status is: {{variables.workflow.status}}.',
                },
            ],
        },
        {
            id: 'content-writer',
            label: 'Content Writer',
            messages: [
                {
                    id: 'msg-1',
                    role: 'system' as const,
                    label: 'System Prompt',
                    content: 'You are a professional content writer for {{variables.companyName}}. Write in a tone appropriate for the {{user.profile.role}} audience.\n\nContext:\n- Company: {{variables.companyName}}\n- Target audience role: {{user.profile.role}}\n- Company: {{user.profile.company}}',
                },
                {
                    id: 'msg-2',
                    role: 'user' as const,
                    label: 'Content Request',
                    content: 'Write a blog post about {{conversation.topic}} for our {{user.plan}} tier customers.',
                },
            ],
        },
        {
            id: 'data-analyst',
            label: 'Data Analyst',
            messages: [
                {
                    id: 'msg-1',
                    role: 'system' as const,
                    label: 'System Prompt',
                    content: 'You are a data analyst assistant. Analyze data for {{user.name}} ({{user.profile.company}}).\n\nUser timezone: {{user.profile.timezone}}\nPreferred language: {{user.preferences.language}}\n\nProvide insights based on the conversation context and available data.',
                },
                {
                    id: 'msg-2',
                    role: 'user' as const,
                    label: 'Analysis Request',
                    content: 'Analyze the support ticket {{variables.ticketId}} with priority {{variables.priority}}. The conversation has {{conversation.messageCount}} messages about {{conversation.topic}}.',
                },
            ],
        },
    ];

    const toggleExpand = (path: string) => {
        setExpandedPaths((prev) => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    };

    const handleDragStart = (e: React.DragEvent, path: string) => {
        e.dataTransfer.setData('text/plain', `{{${path}}}`);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const updateMessage = (id: string, content: string) => {
        setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, content } : msg)));
    };

    const addMessage = (role: 'system' | 'user' | 'assistant') => {
        const newMsg: PromptMessage = {
            id: `msg-${Date.now()}`,
            role,
            label: `${ROLE_CONFIG[role].label} Message`,
            content: '',
        };
        setMessages((prev) => [...prev, newMsg]);
    };

    const removeMessage = (id: string) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
    };

    const loadPreset = (presetId: string) => {
        const preset = presets.find((p) => p.id === presetId);
        if (preset) {
            setSelectedPreset(presetId);
            setMessages(preset.messages.map((m) => ({ ...m })));
        }
    };

    const resolveExpression = (template: string): string => {
        return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
            const parts = path.trim().split('.');
            let value: any = contextData;
            for (const part of parts) {
                if (value && typeof value === 'object' && part in value) {
                    value = value[part];
                } else {
                    return `{{${path}}}`;
                }
            }
            return typeof value === 'object' ? JSON.stringify(value) : String(value);
        });
    };

    const renderJsonTree = (data: any, parentPath: string = 'root', parentKey: string = 'data'): JSX.Element[] => {
        if (data === null || data === undefined) {
            return [
                <div
                    key={parentPath}
                    className="json-node json-leaf"
                    draggable
                    onDragStart={(e) => handleDragStart(e, parentKey)}
                >
                    <GripVertical size={14} className="drag-icon" />
                    <span className="json-key">{parentKey}:</span>
                    <span className="json-value json-null">null</span>
                </div>,
            ];
        }

        const type = Array.isArray(data) ? 'array' : typeof data;

        if (type === 'object' || type === 'array') {
            const isExpanded = expandedPaths.has(parentPath);
            const entries = type === 'array' ? data.map((item: any, i: number) => [i, item]) : Object.entries(data);

            return [
                <div key={parentPath} className="json-node">
                    <div
                        className="json-node-header"
                        onClick={() => toggleExpand(parentPath)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, parentKey)}
                    >
                        <GripVertical size={14} className="drag-icon" />
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <span className="json-key">{parentKey}:</span>
                        <span className="json-type">
                            {type === 'array' ? `Array[${data.length}]` : 'Object'}
                        </span>
                    </div>
                    {isExpanded && (
                        <div className="json-children">
                            {entries.map(([key, value]: [any, any]) => {
                                const childPath = `${parentPath}.${key}`;
                                const childKey = parentKey === 'data' ? String(key) : `${parentKey}.${key}`;
                                return renderJsonTree(value, childPath, childKey);
                            })}
                        </div>
                    )}
                </div>,
            ];
        }

        // Primitive values
        return [
            <div
                key={parentPath}
                className="json-node json-leaf"
                draggable
                onDragStart={(e) => handleDragStart(e, parentKey)}
            >
                <GripVertical size={14} className="drag-icon" />
                <span className="json-key">{parentKey}:</span>
                <span className={`json-value json-${type}`}>
                    {type === 'string' ? `"${data}"` : String(data)}
                </span>
            </div>,
        ];
    };

    return (
        <div className="prompt-page">
            {/* Navigation */}
            <nav className="prompt-nav">
                <div className="prompt-nav-inner">
                    <Link to="/" className="prompt-nav-back">
                        <ArrowLeft size={18} />
                        Back to Home
                    </Link>
                    <span className="prompt-nav-title">AI Prompt Builder</span>
                    <div className="prompt-nav-spacer" />
                </div>
            </nav>

            {/* Main Content */}
            <div className="prompt-container">
                <div className="prompt-layout">
                    {/* Left Panel - Context Data */}
                    <aside className="prompt-data-panel">
                        <div className="panel-header">
                            <h3 className="panel-title">Context Variables</h3>
                            <p className="panel-subtitle">Drag into prompt fields</p>
                        </div>

                        <div className="json-tree">
                            {renderJsonTree(contextData)}
                        </div>

                        <div className="panel-footer">
                            <p className="hint">💡 Drag any item to a prompt field</p>
                        </div>
                    </aside>

                    {/* Right Panel - Prompt Builder */}
                    <main className="prompt-builder-panel">
                        {/* Preset Selector */}
                        <div className="prompt-presets">
                            <div className="prompt-presets-header">
                                <h2 className="prompt-presets-title">Prompt Template</h2>
                                <p className="prompt-presets-subtitle">Choose a preset or build your own message chain</p>
                            </div>
                            <div className="prompt-presets-list">
                                {presets.map((preset) => (
                                    <button
                                        key={preset.id}
                                        onClick={() => loadPreset(preset.id)}
                                        className={`prompt-preset-btn ${selectedPreset === preset.id ? 'active' : ''}`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message Chain */}
                        <div className="prompt-messages">
                            {messages.map((msg, index) => {
                                const roleConfig = ROLE_CONFIG[msg.role];
                                return (
                                    <div key={msg.id} className="prompt-message">
                                        <div className="prompt-message-header">
                                            <div className="prompt-message-meta">
                                                <span
                                                    className="prompt-role-badge"
                                                    style={{
                                                        color: roleConfig.color,
                                                        background: roleConfig.bg,
                                                        borderColor: roleConfig.border,
                                                    }}
                                                >
                                                    {roleConfig.label}
                                                </span>
                                                <span className="prompt-message-label">{msg.label}</span>
                                            </div>
                                            <div className="prompt-message-actions">
                                                <span className="prompt-message-index">#{index + 1}</span>
                                                {messages.length > 1 && (
                                                    <button
                                                        className="prompt-message-delete"
                                                        onClick={() => removeMessage(msg.id)}
                                                        title="Remove message"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="prompt-message-editor dark-editor">
                                            <ExpressionEditor
                                                value={msg.content}
                                                onChange={(data) => updateMessage(msg.id, data.value)}
                                                autocompleteData={contextData}
                                                rows={msg.role === 'system' ? 6 : 3}
                                                placeholder={`Enter ${roleConfig.label.toLowerCase()} message template...`}
                                                enableDragDrop={true}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Add Message */}
                        <div className="prompt-add-row">
                            <span className="prompt-add-label">Add message:</span>
                            <button className="prompt-add-btn prompt-add-system" onClick={() => addMessage('system')}>
                                <Plus size={14} /> System
                            </button>
                            <button className="prompt-add-btn prompt-add-user" onClick={() => addMessage('user')}>
                                <Plus size={14} /> User
                            </button>
                            <button className="prompt-add-btn prompt-add-assistant" onClick={() => addMessage('assistant')}>
                                <Plus size={14} /> Assistant
                            </button>
                        </div>

                        {/* Preview */}
                        <div className="prompt-preview">
                            <div className="prompt-preview-header">
                                <h3 className="prompt-preview-title">
                                    <Play size={16} />
                                    Resolved Preview
                                </h3>
                                <button className="prompt-reset-btn" onClick={() => loadPreset(selectedPreset)} title="Reset to preset">
                                    <RotateCcw size={14} />
                                    Reset
                                </button>
                            </div>
                            <div className="prompt-preview-body">
                                {messages.map((msg, index) => {
                                    const roleConfig = ROLE_CONFIG[msg.role];
                                    return (
                                        <div key={msg.id} className="prompt-preview-message">
                                            <div className="prompt-preview-role">
                                                <span
                                                    className="prompt-preview-role-dot"
                                                    style={{ background: roleConfig.color }}
                                                />
                                                <span className="prompt-preview-role-name">{roleConfig.label}</span>
                                                <span className="prompt-preview-role-index">#{index + 1}</span>
                                            </div>
                                            <div className="prompt-preview-content">
                                                {resolveExpression(msg.content) || '(empty)'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* API Output */}
                        <div className="prompt-api-output">
                            <label className="prompt-api-label">API Request Body (messages array)</label>
                            <div className="prompt-api-box">
                                <pre>
                                    {JSON.stringify(
                                        {
                                            model: contextData.variables.model,
                                            temperature: contextData.variables.temperature,
                                            max_tokens: contextData.variables.maxTokens,
                                            messages: messages.map((msg) => ({
                                                role: msg.role,
                                                content: resolveExpression(msg.content),
                                            })),
                                        },
                                        null,
                                        2
                                    )}
                                </pre>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="prompt-tips">
                            <h4 className="prompt-tips-title">Tips:</h4>
                            <ul className="prompt-tips-list">
                                <li>Drag context variables from the left panel into any message field</li>
                                <li>Type <code>{'{{'}</code> to trigger autocomplete with available variables</li>
                                <li>Add multiple messages to build a complete conversation chain</li>
                                <li>The preview shows resolved values — exactly what your LLM will receive</li>
                                <li>Switch between presets to explore different prompt patterns</li>
                            </ul>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};
