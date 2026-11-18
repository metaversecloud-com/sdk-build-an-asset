// Theme routing: the first path segment picks the theme.
import { buildAsset, expect, test } from "../../fixtures";

test("an unknown theme shows the under-construction page", async ({ page, world }) => {
  test.fail(true, "EXP-434: App destructures getThemeData() before routing, so an unknown theme crashes to a blank page");
  await world.seed({ asset: buildAsset("robot") });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(world.url("/robot"));

  await expect(page.getByRole("heading", { name: "Under Construction" })).toBeVisible({ timeout: 5000 });
  expect(errors).toEqual([]);
});

test("an unknown page inside a theme shows the under-construction page", async ({ page, world }) => {
  await world.seed({ asset: buildAsset("locker") });
  await page.goto(world.url("/locker/nope"));

  await expect(page.getByRole("heading", { name: "Under Construction" })).toBeVisible();
});

test("the drawer shows an error when the world can't be loaded", async ({ page, world }) => {
  test.fail(true, "EXP-434: App keeps showing the loading spinner when /world-and-visitor fails");
  await world.seed({ asset: buildAsset("locker") });
  await page.goto(world.url("/locker", { visitorId: "999" }));

  await expect(page.getByText("There was an error while getting world and visitor details")).toBeVisible();
});
