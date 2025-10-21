from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Sign in first
        page.goto("http://localhost:3000/auth/signin")
        page.get_by_placeholder("Email address").fill("test@example.com")
        page.get_by_placeholder("Password").fill("password")
        page.get_by_role("button", name="Sign in").click()

        # Wait for navigation to the dashboard
        expect(page).to_have_url("http://localhost:3000/dashboard")

        # Navigate to the screens page
        page.goto("http://localhost:3000/screens")
        expect(page.get_by_role("heading", name="Screens")).to_be_visible()

        # Click the "Add Screen" button
        page.get_by_role("button", name="Add Screen").click()

        # Wait for the pairing code modal to appear
        expect(page.get_by_role("heading", name="Pair Your Screen")).to_be_visible()

        # Take a screenshot of the modal
        page.screenshot(path="jules-scratch/verification/pairing_modal.png")

        # Get the pairing code
        pairing_code = page.locator("p.text-4xl").inner_text()

        # Close the modal
        page.get_by_role("button", name="Done").click()

        # Wait for the modal to disappear
        expect(page.get_by_role("heading", name="Pair Your Screen")).not_to_be_visible()

        # Wait for the new device to appear in the list with the correct pairing code
        expect(page.get_by_text(pairing_code)).to_be_visible()
        expect(page.locator(f"//tr[td[text()='{pairing_code}']]//td[text()='pairing']")).to_be_visible()

        # Take a final screenshot of the screens page
        page.screenshot(path="jules-scratch/verification/screens_page_after_pairing.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
