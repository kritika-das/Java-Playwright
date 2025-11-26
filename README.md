# Java Playwright Automation Framework

This repository contains a **Java-based Playwright automation framework** designed for fast, reliable, and maintainable UI test automation.

---

## 🚀 Features

* Built using **Java + Playwright**
* Follows **Page Object Model (POM)**
* Supports **TestNG** for test execution
* Includes **configurable browser settings** (Chrome, Edge, Firefox)
* Uses **Maven** for dependency management
* Provides **utility classes** for reusable components
* Supports **headless/headful modes**
* Ready for **CI/CD integration**

---

## 📁 Project Structure

```
Java-Playwright
│
├── src/main/java
│   ├── base
│   │   └── BaseTest.java
│   ├── pages
│   │   ├── LoginPage.java
│   │   ├── HomePage.java
│   │   └── ...
│   ├── utils
│   │   ├── ConfigReader.java
│   │   ├── PlaywrightFactory.java
│   │   └── TestUtils.java
│
├── src/test/java
│   ├── testcases
│   │   ├── LoginTest.java
│   │   └── ...
│   └── testdata
│       └── data.json
│
├── testng.xml
├── pom.xml
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```sh
git clone https://github.com/kritika-das/Java-Playwright.git
```

### 2. Install dependencies

```sh
mvn clean install
```

### 3. Run tests

```sh
mvn test
```

Or run TestNG suite:

```sh
mvn test -DsuiteXmlFile=testng.xml
```

---

## 🧪 Writing Tests

A simple test example:

```java
public class LoginTest extends BaseTest {
    @Test
    public void loginTest() {
        LoginPage login = new LoginPage(page);
        login.login("username", "password");
    }
}
```

---

## 🏗 Architecture

### **1. Base Layer**

* Initializes Playwright
* Manages browser context
* Provides hooks for setup/teardown

### **2. Page Layer**

* Each page has its own class
* All locators + page actions handled here

### **3. Utilities Layer**

* Config file reader
* Reusable helper functions
* Browser factory

### **4. Test Layer**

* Contains only test logic
* Uses methods from page classes

---

## 🖥 Supported Browsers

* Chrome
* Edge
* Firefox
* WebKit

Set browser in `config.properties`:

```
browser=chrome
headless=false
```

---

## 🔧 Configuration File (`config.properties`)

```
baseUrl=https://example.com
browser=chrome
headless=true
```

---

## 🚦 CI/CD Integration

Easily integrates with:

* GitHub Actions
* Jenkins
* GitLab CI

Sample GitHub Actions workflow:

```yaml
name: Playwright Tests

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Java
        uses: actions/setup-java@v3
        with:
          java-version: '17'
      - name: Run tests
        run: mvn test
```

---

## 📌 Best Practices

* Keep page classes clean and focused
* Use utility methods for reusable logic
* Never hardcode credentials
* Validate UI and API (if applicable)
* Keep tests atomic and independent

---

## 🤝 Contribution Guidelines

1. Fork the repo
2. Create a new branch: `feature/new-feature`
3. Commit changes
4. Create a pull request

---





