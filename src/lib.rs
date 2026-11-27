//! TripMate Desktop: the Rust shell around the Web build (EPIC-11, card DF1).
//!
//! This card only builds the project. The window that loads the Web build
//! is DESK-01 (EPIC-12).

/// Starts the app. Panics when the Tauri runtime cannot start, which is
/// fatal for a desktop shell.
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running TripMate Desktop");
}

#[cfg(test)]
mod tests {
    #[test]
    fn config_names_the_app() {
        let context: tauri::Context<tauri::Wry> = tauri::generate_context!();
        let config = context.config();
        assert_eq!(config.identifier, "com.tripmate.desktop");
        assert_eq!(config.product_name.as_deref(), Some("TripMate"));
    }
}
