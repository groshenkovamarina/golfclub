import { ClientFunction, Selector } from "testcafe";
import useragent from "useragent";
import looksSame from "looks-same";

fixture `golfclub tests`
    .page("http://localhost:4200/")
    .beforeEach(async t => {
        await t
            .resizeWindow(1280, 1080);
    });

const etalonsPath = "tests/etalons/";
const screenshotsPath = "tests/screenshots/";
const diffPath = "tests/diff/";

const waitReadyState = ClientFunction(() => {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            if(window.isReady) {
                clearInterval(interval);
                resolve();
            }
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            resolve();
        }, 120000);
    });
});

const clientFunc1 = ClientFunction(() => {
    document.getElementsByClassName("details")[0].innerHTML = "Fri 04 - Fri 11, September 2015";
    document.getElementsByClassName("dx-button-text")[4].innerHTML = "30 Aug-5 Sep 2015";
});

const clientFunc2 = ClientFunction(() => {
    document.getElementsByClassName("details")[2].innerHTML = "Fri 04 - Fri 11, September 2015";
    document.getElementsByClassName("dx-button-text")[1].innerHTML = "30 Aug-5 Sep 2015";
});

const getUA = ClientFunction(() => navigator.userAgent);

const makeDiff = (imageName, browserName) => {
    looksSame.createDiff({
        reference: etalonsPath + imageName + browserName,
        current: screenshotsPath + imageName + browserName,
        diff: diffPath + imageName + "_diff" + browserName,
        highlightColor: '#ff00ff',
        strict: false,
        tolerance: 2.5,
        antialiasingTolerance: 0,
        ignoreAntialiasing: true,
        ignoreCaret: true
    }, function() {
        return true;
    });

    return false;
};

test("log in", async t => {
    const ua  = await getUA();
    const screenshotSuffix = "_" +  useragent.parse(ua).family + ".png";

    await waitReadyState();

    await t
        .takeScreenshot("GolfClub_Home_view" + screenshotSuffix);

    await t
        .expect(makeDiff("GolfClub_Home_view", screenshotSuffix)).notOk("Test failed. GolfClub_Home_view_diff is created")
        //.click(Selector(".log-in.authorization"))
        .takeScreenshot("GolfClub_Login_Popup" + screenshotSuffix)

    await t
        .expect(makeDiff("GolfClub_Login_Popup", screenshotSuffix)).notOk("Test failed. GolfClub_Login_Popup_diff is created")
        .typeText(Selector(".dx-texteditor-input").nth(5), "admin")
        .pressKey("tab")
        .typeText(Selector(".dx-texteditor-input").nth(6), "admin")
        .click(Selector(".buttons-on-popup .green-button"));
});

test("booking", async t => {
    const ua  = await getUA();
    const screenshotSuffix = "_" +  useragent.parse(ua).family + ".png";

    await t
        .click(Selector(".dx-dropdowneditor-icon").nth(0))
        .click(Selector(".dx-list-item-content").nth(1))
        .click(Selector(".dx-dropdowneditor-icon").nth(1))
        .wait(2000)
        .click(Selector(".dx-calendar-today"))
        .click(Selector(".search"));

    
    const executeClientFunc1 = await clientFunc1();
    
    await t
        .wait(2000)
        .takeScreenshot("GolfClub_Search_View" + screenshotSuffix)

    await t
        .expect(makeDiff("GolfClub_Search_View", screenshotSuffix)).notOk("Test failed. GolfClub_Search_View_diff is created")
        .click(Selector(".button").nth(2))
        .takeScreenshot("GolfClub_Book_Popup" + screenshotSuffix)

    await t
        .expect(makeDiff("GolfClub_Book_Popup", screenshotSuffix)).notOk("Test failed. GolfClub_Book_Popup_diff is created")
        .click(Selector(".button-popup").nth(0))
        .click(Selector(".button-popup").nth(1))
        .click(Selector(".button").nth(1))
        .click(Selector(".button-popup").nth(0))
        .click(Selector(".image").nth(1));

    const executeClientFunc2 = await clientFunc2();

    await t
        .wait(2000)
        .takeScreenshot("GolfClub_Info_View" + screenshotSuffix)

    await t
        .expect(makeDiff("GolfClub_Info_View", screenshotSuffix)).notOk("Test failed. GolfClub_Info_View_diff is created")
        .click(Selector(".button"))
        .wait(2000)
        .takeScreenshot("GolfClub_Info_View_Book_Popup" + screenshotSuffix);

    await t
        .expect(makeDiff("GolfClub_Info_View_Book_Popup", screenshotSuffix)).notOk("Test failed. GolfClub_Info_View_Book_Popup_diff is created")
        .click(Selector(".button-popup").nth(0))
        .click(Selector(".button"))


    await t
        .click(Selector(".dx-dropdowneditor-icon").nth(0))

    await t
        .wait(2000)
        .click(Selector(".dx-calendar-today").nextSibling())
        .click(Selector(".dx-popup-done.dx-button"))
        .click(Selector(".button-popup.white-text.green-button"));
});


test("special offers", async t => {
    await t
        .click(Selector(".image").nth(3))
        .click(Selector(".dx-item.dx-tab").nth(0))
        .click(Selector(".dx-item.dx-tab").nth(2))
        .click(Selector(".logo").nth(0))
        .click(Selector(".more-info"));

    await t
        .click(Selector(".dx-item.dx-tab").nth(0))
        .click(Selector(".dx-item.dx-tab").nth(2));
});


test("change search", async t => {

    
    const ua  = await getUA();
    const screenshotSuffix = "_" +  useragent.parse(ua).family + ".png";

    await t
        .click(Selector(".dx-dropdowneditor-icon").nth(0))
        .click(Selector(".dx-list-item-content").nth(0))
        .click(Selector(".dx-dropdowneditor-icon").nth(1))
        .wait(2000)
        .click(Selector(".dx-calendar-today"))
        .click(Selector(".search"));
    
    await t
        .click(Selector(".dx-item.dx-tab").nth(0))
        .click(Selector(".dx-item.dx-tab").nth(2))
        .click(Selector(".green-button").withText("Change Search"))
        .takeScreenshot("GolfClub_Search_View_Search_Popup" + screenshotSuffix);

    await t
        .expect(makeDiff("GolfClub_Search_View_Search_Popup", screenshotSuffix)).notOk("Test failed. GolfClub_Search_View_Search_Popup_diff is created")
        .click(Selector(".dx-dropdowneditor-icon").nth(0))
        .click(Selector(".dx-list-item-content").nth(3))
        .click(Selector(".search"));

    await t
        .click(Selector(".dx-item.dx-tab").nth(0))
        .click(Selector(".dx-item.dx-tab").nth(2))
        .click(Selector(".image").nth(2));

    await t
        .click(Selector(".green-button").withText("Change Search"))
        .takeScreenshot("GolfClub_Info_View_Search_Popup" + screenshotSuffix);

    await t
        .expect(makeDiff("GolfClub_Info_View_Search_Popup", screenshotSuffix)).notOk("Test failed. GolfClub_Info_View_Search_Popup_diff is created")
        .click(Selector(".dx-dropdowneditor-icon").nth(0))
        .click(Selector(".dx-list-item-content").nth(2))
        .click(Selector(".search"));
});