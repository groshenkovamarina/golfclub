import { ClientFunction, Selector} from "testcafe";
import looksSame from "looks-same";
import fs from "fs";
import request from "request";

fixture `golfclub tests`
    .page("http://localhost:4200/")
    .beforeEach(async t => {
        await t
            .resizeWindow(1280, 1080);
    });


const getUA = ClientFunction(() => {
    const ua  = window.navigator.userAgent;
    let browserName = "";

    if(ua.indexOf("Chrome") >= 0) {
        browserName = "Chrome";
    } else if(ua.indexOf("Firefox") >= 0) {
        browserName = "Firefox";
    } else {
        browserName = "IE";
    }

    return "_" + browserName + ".png";
});
 
const getImagesPath = (imageName, browserName) => {
    const etalonsPath = "tests/etalons/";
    const screenshotsPath = "tests/screenshots/";
    const diffPath = "tests/diff/";

    return  { 
        "etalon": etalonsPath + imageName + browserName,
        "screenshot": screenshotsPath + imageName + browserName,
        "diff": diffPath + imageName + "_diff" + browserName
    };
}

const clientFunc1 = ClientFunction(() => {
    document.getElementsByClassName("details")[0].innerHTML = "Mon 11-Mon 18, November 2019";
    document.getElementsByClassName("dx-button-text")[4].innerHTML = "10-16 November 2019";
});

const clientFunc2 = ClientFunction(() => {
    document.getElementsByClassName("details")[2].innerHTML = "Mon 11-Mon 18, November 2019";
    document.getElementsByClassName("dx-button-text")[1].innerHTML = "10-16 November 2019";
});

const checkDiff = (imageName, browserName) => {

    return new Promise (resolve => { 
        looksSame(
        getImagesPath(imageName, browserName).etalon,
        getImagesPath(imageName, browserName).screenshot,
        (error, details) => {
            if(error) console.log(error);

            resolve(details.equal);
        });
    }).then(equal => {
        return new Promise (resolve => { 
            if(!equal) {
                if(!fs.existsSync("./tests/diff")) {
                    fs.mkdirSync("./tests/diff")
                }

                looksSame.createDiff({
                    reference: getImagesPath(imageName, browserName).etalon,
                    current: getImagesPath(imageName, browserName).screenshot,
                    diff: getImagesPath(imageName, browserName).diff,
                    highlightColor: '#ff00ff',
                    strict: false,
                    tolerance: 2.5,
                    antialiasingTolerance: 0,
                    ignoreAntialiasing: true,
                    ignoreCaret: true
                }, function(error) {
                    if(error) console.log(error);

                    resolve(true);
                });
            } else resolve(false);
        })
    }).then(isDiffCreated => {
        if(isDiffCreated) {
            const imageAsBase64 = fs.readFileSync(getImagesPath(imageName, browserName).diff, "base64");
            const options = {
                url: "https://api.imgbb.com/1/upload?key=5a6b49adad4228e6b2478608733cb134",
                method: "POST",
                form: {
                    image: imageAsBase64
                }
            }
        
            return new Promise((resolve) => {
                request(options, (error, response) => {
                    if(error) console.log(error);

                    const diffUrl = JSON.parse(response.body).data.url;
                    const diffHref = new URL(diffUrl);

                    resolve(true)
                    console.log(getImagesPath(imageName, browserName).diff + " is created " + diffHref.href);
                });
            })
        }
    })
};

test("log in", async t => {
    const screenshotSuffix = await getUA();
    let isDiff = false;

    await t
        .takeScreenshot("GolfClub_Home_view" + screenshotSuffix);


    isDiff = await checkDiff("GolfClub_Home_view", screenshotSuffix);

    await t
        //.expect(isDiff).notOk("Test failed")
        .click(Selector(".log-in.authorization"))
        .takeScreenshot("GolfClub_Login_Popup" + screenshotSuffix);

    isDiff = await checkDiff("GolfClub_Login_Popup", screenshotSuffix);

    await t
        //.expect(isDiff).notOk("Test failed")
        .typeText(Selector(".dx-texteditor-input").nth(5), "admin")
        .pressKey("tab")
        .typeText(Selector(".dx-texteditor-input").nth(6), "admin")
        .click(Selector(".buttons-on-popup .green-button"));
});

test("booking", async t => {
    const screenshotSuffix = await getUA();
    let isDiff = false;

    await t
        .click(Selector(".dx-dropdowneditor-icon").nth(0))
        .click(Selector(".dx-list-item-content").nth(1))
        .click(Selector(".dx-dropdowneditor-icon").nth(1))
        .wait(2000)
        .click(Selector(".dx-calendar-today"))
        .click(Selector(".search"));

    
    await clientFunc1();

    // await t
    //     .click(Selector(".dx-scheduler-navigator-caption"))
    //     .click(Selector(".dx-calendar-caption-button").nth(0))
    //     .click(Selector(".dx-calendar-caption-button").nth(0))
    //     .click(Selector(".dx-calendar-cell").withText("2019"))
    //     .click(Selector(".dx-calendar-cell").withText("Nov"))
    //     .click(Selector(".dx-calendar-cell").withText("15"))
    
    await t
        .wait(2000)
        .takeScreenshot("GolfClub_Search_View" + screenshotSuffix)

    isDiff = await checkDiff("GolfClub_Search_View", screenshotSuffix);

    await t
        //.expect(isDiff).ok("Test failed. GolfClub_Search_View_diff is created")
        .click(Selector(".button").nth(2))
        .takeScreenshot("GolfClub_Book_Popup" + screenshotSuffix)

    isDiff = await checkDiff("GolfClub_Book_Popup", screenshotSuffix);

    await t
        //.expect(isDiff).ok("Test failed. GolfClub_Book_Popup_diff is created")
        .click(Selector(".button-popup").nth(0))
        .click(Selector(".button-popup").nth(1))
        .click(Selector(".button").nth(1))
        .click(Selector(".button-popup").nth(0))
        .click(Selector(".image").nth(1));

    await clientFunc2();

    // await t
    //     .click(Selector(".dx-scheduler-navigator-caption"))
    //     .click(Selector(".dx-calendar-caption-button").nth(0))
    //     .click(Selector(".dx-calendar-caption-button").nth(0))
    //     .click(Selector(".dx-calendar-cell").withText("2019"))
    //     .click(Selector(".dx-calendar-cell").withText("Nov"))
    //     .click(Selector(".dx-calendar-cell").withText("15"));

    await t
        .wait(2000)
        .takeScreenshot("GolfClub_Info_View" + screenshotSuffix)

    isDiff = await checkDiff("GolfClub_Info_View", screenshotSuffix);

    await t
        //.expect(isDiff).ok("Test failed. GolfClub_Info_View_diff is created")
        .click(Selector(".button"))
        .wait(2000)
        .takeScreenshot("GolfClub_Info_View_Book_Popup" + screenshotSuffix);

    isDiff = await checkDiff("GolfClub_Info_View_Book_Popup", screenshotSuffix);

    await t
        //.expect(isDiff).ok("Test failed. GolfClub_Info_View_Book_Popup_diff is created")
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
    const screenshotSuffix = await getUA();
    let isDiff = false;

    await t
        .click(Selector(".dx-dropdowneditor-icon").nth(0))
        .click(Selector(".dx-list-item-content").nth(0))
        .click(Selector(".dx-dropdowneditor-icon").nth(1))
        .wait(2000)
        .click(Selector(".dx-calendar-today"))
        .click(Selector(".search"));

    // await t
    //     .click(Selector(".dx-scheduler-navigator-caption"))
    //     .click(Selector(".dx-calendar-caption-button").nth(0))
    //     .click(Selector(".dx-calendar-caption-button").nth(0))
    //     .click(Selector(".dx-calendar-cell").withText("2019"))
    //     .click(Selector(".dx-calendar-cell").withText("Nov"))
    //     .click(Selector(".dx-calendar-cell").withText("15"))
    
    await t
        .click(Selector(".dx-item.dx-tab").nth(0))
        .click(Selector(".dx-item.dx-tab").nth(2))
        .click(Selector(".green-button").withText("Change Search"))
        .takeScreenshot("GolfClub_Search_View_Search_Popup" + screenshotSuffix);

    isDiff = await checkDiff("GolfClub_Search_View_Search_Popup", screenshotSuffix);

    await t
        //.expect(isDiff).notOk("Test failed")
        .click(Selector(".dx-dropdowneditor-icon").nth(0))
        .click(Selector(".dx-list-item-content").nth(3))
        .click(Selector(".search"));

    
    // await t
    //     .click(Selector(".dx-scheduler-navigator-caption"))
    //     .click(Selector(".dx-calendar-caption-button").nth(0))
    //     .click(Selector(".dx-calendar-caption-button").nth(0))
    //     .click(Selector(".dx-calendar-cell").withText("2019"))
    //     .click(Selector(".dx-calendar-cell").withText("Nov"))
    //     .click(Selector(".dx-calendar-cell").withText("15"))

    await t
        .click(Selector(".dx-item.dx-tab").nth(0))
        .click(Selector(".dx-item.dx-tab").nth(2))
        .click(Selector(".image").nth(2));

    await t
        .click(Selector(".green-button").withText("Change Search"))
        .takeScreenshot("GolfClub_Info_View_Search_Popup" + screenshotSuffix);

    isDiff = await checkDiff("GolfClub_Info_View_Search_Popup", screenshotSuffix);

    await t
        //.expect(isDiff).notOk("Test failed")
        .click(Selector(".dx-dropdowneditor-icon").nth(0))
        .click(Selector(".dx-list-item-content").nth(2))
        .click(Selector(".search"));
});