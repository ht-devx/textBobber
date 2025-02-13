### textBobber

> A plugin that mimics the typewriter effect in visual novels for a specified text box (or multiple text boxes) with custom delay and transition values.

**Preview / Demo:** [ht-devx.github.io/textBobber](https://ht-devx.github.io/textBobber)\
**Demo code:** [jsfiddle.net/ht_dev/gfvmcuwo](https://jsfiddle.net/ht_dev/gfvmcuwo)\
**Author:** HT ([@ ht-devx](https://github.com/ht-devx))\
**Release date:** 2024-08-23\
**Last updated:** 2025-02-12 5:44PM [GMT-7]

**Preview:**  
![Screenshot GIF of how the textBobber plugin is used. In the style of a visual novel, the name of "Lorem Ipsum says" stylized in full uppercase sits on the left, with a pen sketch of a woman on the right. Underneath sits a text box. Firstly, the text box shows "One, don't pick up the phone" followed by a paragraph of dummy text, in which each character fades in one after the other. The user clicks on the text box, forcing the rest of the characters to finish their animations, and thusly the entire text is shown, with a next arrow showing in the bottom right of the box. The user then clicks on the text box to go to the next dialogue text. This action repeats until the last dialogue (three in total) are complete.](https://github.com/user-attachments/assets/19dac179-eadb-4cff-bd9a-f4db1e5ab00b)


---

#### Table of Contents:
* [About](#textbobber)
* [How to Use](#how-to-use)
* [Usage Notes](#usage-notes)
* [Attribution](#attribution)
* [Troubleshooting](#troubleshooting)

---

#### How to use:

**Step 1:**

Include the following after `<head>`:
```html
<script src="https://cdn.jsdelivr.net/gh/ht-devx/textBobber/v3/init.min.js"></script>

<script>
textBobber({
    wrapper: ".speech-container", // change this to the selector wrapper ALL of your texts

    initialDelay: "0.4s", // delay before textBobber starts animating

    textContainer: ".all-texts", // change to the selector that contains ALL text boxes
    textSelectors: ".one-text", // change this to the selector that represents one text box
    textSelectorsFadeSpeed: "0.3s", // fade-in & fade-out speed from one text box to the next

    characterDelay: "0.06s", // delay of each character showing up
    characterAnimationSpeed: "0.15s", // character animation speed

    nextButton: ".next-arrow", // change this to your "next dialogue" selector
    nextButtonAnimationSpeed: "0.3s", // fade-in & fade-out speed of the next arrow appearing & disappearing

    height: "compact", // "tall" or "compact"
    loop: false // true or false; when the last box finishes, restart the boxes
})
</script>
```

**Step 2:**

Make sure you have the following HTML markup (more or less):
```html
<div class="speech-container">
    <div class="all-texts">
        <div class="one-text">One for the money.</div>
        <div class="one-text">Two for the show.</div>
        <div class="one-text">Three to make ready.</div>
        <div class="one-text">Four to go.</div>
    </div>
    
    <div class="next-arrow">(next.)</div>
</div>
```

Things to note from the above snippet (HTML):
- `.speech-container` is the **main wrapper** that includes all the text boxes (dialogues) *and* the next button.
- `.all-texts` includes each of the text box dialogues.
- `.next-arrow` is within the `.speech-container` (main wrapper), but *not* part of `.all-texts`.

**Step 3:**

Include the following CSS:
```css
.speech-container {
    display:none;
}

.speech-container.ready {
    display:block;
}

/*------- DISABLING ANIMATIONS FOR ACCESSIBILITY OPTIONS -------*/
@media(prefers-reduced-motion: reduce){
    [text-bobber], [text-bobber-chara]{
        transition:none!important;
    }
}
```

Things to note from the above snippet (CSS):
- Please try to mimic/integrate the styling as closely as you can.
- All speeds are assigned in the plugin arguments rather than in the CSS.
- Currently, most of the animations have a fade-in/fade-out effect, but you can change these as you wish.
- **Do** change the selector names to match the ones you assigned in the plugin arguments.
- Do not change the names of `.show`, `.bob-it`, `[text-bobber]` and `[text-bobber-chara]`.
- Feel free to try out your changes in the playground below:

**Code playground:**  
[jsfiddle.net/ht_dev/gfvmcuwo/](https://jsfiddle.net/ht_dev/gfvmcuwo/)

---

#### Usage Notes:
- All arguments in `textBobber()` should be filled and valid.
- You must also include a next button and make sure it exists, regardless of whether it will be used or not.

---

#### Attribution:
No visible credit/attribution is required; please do not remove the existing credits in the code. A link to this repository would be greatly appreciated.

---

#### Troubleshooting:
If you need further assistance, please contact me at: [hello.ht.dev@gmail.com](mailto:hello.ht.dev@gmail.com)
