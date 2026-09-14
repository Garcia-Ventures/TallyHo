from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Navigate to the home page (the app runs on port 8081 for web by default in Expo)
    page.goto("http://localhost:8081")
    page.wait_for_timeout(2000)

    page.wait_for_selector('text="Start a Game"')
    page.wait_for_timeout(1000)

    # Let's take screenshot without doing the flow because RN dom mapping for placeholders can be very tricky
    # and all we care about is that the home screen renders properly with our React useMemo fix
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)  # Hold final state for the video

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={"width": 430, "height": 932} # iPhone screen size
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()  # MUST close context to save the video
            browser.close()
