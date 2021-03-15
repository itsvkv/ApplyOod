const { Builder, By, Key, until } = require('selenium-webdriver');
let driver, username, password;

const args = () => process.argv
    .slice(2)
    .map(arg => arg.split('='))
    .reduce((args, [value, key]) => {
        args[value] = key;
        return args;
    }, {});

async function waitForPageToload() {
    await driver.wait(function () {
        return driver.executeScript('return document.readyState').then(function (readyState) {
            return readyState === 'complete';
        });
    });
}
async function waitForELementToLoadAndsend(selector, text) {
    var element = await getElement(selector)
    await waitForElementToLoad(element);
    element.sendKeys(text);
}
async function getElement(selector) {
    return await driver.findElement(selector);
}

async function waitForElementToLoad(element) {
    await driver.wait(until.elementIsEnabled(element));
}
async function waitForUrlToContain(url) {
    await new Promise((resolve, reject) => {
        var urlLoaded = async () => {
            var loadedUrl = await driver.getCurrentUrl();
            console.log("called start", loadedUrl)
            if (loadedUrl.indexOf(url) > -1) {
                console.log("called in")
                resolve();
            }
            else {
                setTimeout(() => {
                    console.log("called tineout")
                    urlLoaded();
                }, 2000)
            }
        }
        urlLoaded()

    })
    await waitForPageToload();

}
async function waitForModelToClose() {
    await new Promise((resolve, reject) => {
        var modelClosed = async () => {
            var model = await driver.findElement(By.id("processing_modal"));
            var modelDisplay = await model.getCssValue('display')
            console.log(modelDisplay)
            if (modelDisplay == 'none') {
                resolve();
            }
            else {
                setTimeout(() => {
                    modelClosed();
                }, 2000)
            }
        }
        setTimeout(() => {
            modelClosed();
        }, 2000)

    })
    await waitForPageToload();

}


async function logout() {
    await driver.get("http://103.206.50.15:81/campsystems/logout.php");
}

async function save() {
    var element = await driver.findElement(By.id("savebtn"));
    await waitForElementToLoad(element);
    await element.click();

}

async function selectOod() {
    var element = await driver.findElement(By.css('#LEVID > option:nth-child(5)'));
    element.click();
}

async function loadLeavePage() {
    await waitForUrlToContain("home")
    var leaveIcon = await getElement(By.css(".col-sm-2 > :nth-child(2) > img"));
    await leaveIcon.click();
    await waitForUrlToContain("apply_leave");
}

async function login() {
    await loadLogin();
    await waitForELementToLoadAndsend(By.id("username"), username);
    await waitForELementToLoadAndsend(By.id("password"), password);
    await driver.findElement(By.id("btn-login")).click()
}

async function loadLogin() {
    await driver.get('http://103.206.50.15:81/campsystems/login.php');

    await waitForPageToload();
}

async function start() {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().window().maximize();
    await login();
    await loadLeavePage();
    await selectOod();
    await save();
    await waitForModelToClose();
    await logout();
}

(async function () {
    try {
        var input = args();
        username = input.username;
        password = input.password;
        if (!username || !password) {
            throw new Error("please provide username and password")
        }

        await start();
    }
    catch (e) {
        console.log(e)
    }
    finally {
            await driver.quit();
    }
})();