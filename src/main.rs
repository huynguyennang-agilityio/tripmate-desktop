// Hides the console window of a release build on Windows.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tripmate_desktop_lib::run();
}
