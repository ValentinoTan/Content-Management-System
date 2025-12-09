from playwright.sync_api import Page, expect, sync_playwright
import os
import json

def verify_session_date_format(page: Page):
    """
    Verifies that the session date is displayed as a date only (not full timestamp).
    """
    # Enable console logging
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.on("pageerror", lambda err: print(f"Page Error: {err}"))
    page.on("requestfailed", lambda req: print(f"Request failed: {req.url} {req.failure}"))

    # 1. Arrange: Mock the sessions API response.
    mock_sessions = {
        "session1": {
            "sessionName": "Test Session",
            "createdAt": "2023-10-27T10:30:00.000Z",
            "images": {}
        }
    }

    # Intercept requests.
    def handle_sessions(route):
        print("Intercepted /api/sessions")
        route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps(mock_sessions),
            headers={"Access-Control-Allow-Origin": "*"}
        )

    # Provide a valid-looking firebase config so initializeApp doesn't crash
    def handle_config(route):
        print("Intercepted /firebase-config")
        config = {
            "apiKey": "fake-api-key",
            "authDomain": "fake-project.firebaseapp.com",
            "databaseURL": "https://fake-project.firebaseio.com",
            "projectId": "fake-project",
            "storageBucket": "fake-project.appspot.com",
            "messagingSenderId": "123456789",
            "appId": "1:123456789:web:abcdef123456"
        }
        route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps(config),
            headers={"Access-Control-Allow-Origin": "*"}
        )

    def handle_images(route):
        print("Intercepted /api/images")
        route.fulfill(
            status=200,
            content_type="application/json",
            body='{}',
            headers={"Access-Control-Allow-Origin": "*"}
        )

    page.route("**/api/sessions", handle_sessions)
    page.route("**/firebase-config", handle_config)
    page.route("**/api/images", handle_images)

    # 2. Act: Navigate to the application.
    cwd = os.getcwd()
    frontend_path = os.path.join(cwd, "frontend", "index.html")
    page.goto(f"file://{frontend_path}")

    # 3. Act: Click on "Sessions" to load the list.
    sessions_link = page.get_by_role("link", name="Sessions")
    sessions_link.click()

    # 4. Assert: Check the date format.
    # Wait for the session to appear
    session_element = page.locator("h3:has-text('Test Session')")
    expect(session_element).to_be_visible()

    created_at_element = page.locator("p:has-text('Created at:')")
    expect(created_at_element).to_be_visible()

    text_content = created_at_element.text_content()
    print(f"Found text: {text_content}")

    # Check that it contains the date parts but NOT the time parts
    # 10/27/2023 or 27/10/2023 depending on locale
    # We verify time is NOT present.
    assert "10:30" not in text_content, f"Time found in '{text_content}'"

    # 5. Screenshot
    page.screenshot(path="/home/jules/verification/verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--disable-web-security"])
        page = browser.new_page()
        try:
            verify_session_date_format(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
            raise e
        finally:
            browser.close()
