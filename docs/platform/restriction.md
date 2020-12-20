# Code restrition

While coding platform, there some rules, about code/library usage

## 'consulo.platform.base' module

 * No usage of **java.desktop** module. It's mean you can't use classes from **java.awt** & **javax.swing**. Also since **java.beans** package in desktop module, you can't use it too (see *kava.beans*).
 * No usage of **java.lang.System** class, use "consulo.platform.Platform#current()" - system class, can return different values for each platform

## 'consulo.platform.desktop'
 * AWT & Swing allowed - but preferer use **consulo.ui**, since AWT<>Consulo UI, conversion not allowed

## 'consulo.platform.web'
 * AWT & Swing not allowed
