use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Snippet {
    pub id: String,
    pub shortcut: String,
    pub content: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub is_enabled: bool,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Environment {
    pub id: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_default: Option<bool>,
    pub snippets: Vec<Snippet>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub trigger_hotkey: String,
    pub auto_replace: bool,
    pub theme: String,
    pub language: String,
    pub start_with_windows: bool,
    pub run_in_background: bool,
    #[serde(default)]
    pub run_as_admin: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            trigger_hotkey: "`".to_string(),
            auto_replace: false,
            theme: "light".to_string(),
            language: "vi".to_string(),
            start_with_windows: false,
            run_in_background: true,
            run_as_admin: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppData {
    pub environments: Vec<Environment>,
    pub active_environment_id: String,
    pub settings: AppSettings,
}

impl Default for AppData {
    fn default() -> Self {
        let now = chrono::Utc::now().timestamp_millis();
        let sample_snippets = vec![
            Snippet {
                id: "sample-1".to_string(),
                shortcut: "cccd".to_string(),
                content: "012345678901".to_string(),
                description: None,
                is_enabled: true,
                created_at: now,
                updated_at: now,
            },
            Snippet {
                id: "sample-2".to_string(),
                shortcut: "eml".to_string(),
                content: "example@gmail.com".to_string(),
                description: None,
                is_enabled: true,
                created_at: now,
                updated_at: now,
            },
            Snippet {
                id: "sample-3".to_string(),
                shortcut: "ddate".to_string(),
                content: "Hôm nay là ngày: {{date}}".to_string(),
                description: None,
                is_enabled: true,
                created_at: now,
                updated_at: now,
            },
        ];

        let default_env = Environment {
            id: "default".to_string(),
            name: "Mặc định".to_string(),
            description: None,
            is_default: Some(true),
            snippets: sample_snippets,
        };

        Self {
            environments: vec![default_env],
            active_environment_id: "default".to_string(),
            settings: AppSettings::default(),
        }
    }
}
