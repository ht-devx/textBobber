/*----------------------------------------------------
                                                        
      textBobber() by @ht-devx
      * visual novel typewriter effect plugin
      * github.com/ht-devx/textBobber
      * v3.0.0 [2025-02-12]
      2025 | All Rights Reserved

-----------------------------------------------------*/

window.textBobber = function(params){
	let textBobberInit = (params) => {
		/*----------- PARAMETERS -----------*/
    let wrapper = params.wrapper;
    let startingDelay = params.initialDelay;
		let textContainer = params.textContainer;
    let selectors = params.textSelectors;
    let selectorsFadeSpeed = params.textSelectorsFadeSpeed;
    let charaSpeed = params.characterAnimationSpeed;
    let charaDelay = params.characterDelay;
    let nextBtn = params.nextButton;
    let nextBtnSpeed = params.nextButtonAnimationSpeed;
    let height = params.height || "compact";
		let loop = params.loop || "no";

    loop = loop && (loop === true || loop == "true") ? "yes" : "no";

    let charaSel = "span[text-bobber-chara]:not([text-bobber-whitespace])";
		
		/*------- GENERIC FUNCS -------*/
    // get variable type
    function TYPE(x){
      return ({}).toString.call(x).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
    }

    // get speed in raw milliseconds
    function GETSPEED(s){
      let res;
      let nums = Number(s.replace(/[^\d\.]*/g,""));
      let units = s.toLowerCase().replace(/[^a-z]/g,"");
      units == "s" ? res = nums*1000 : res = nums;
      return res
    }

    // wait for text to show up
    // adapted from: stackoverflow.com/a/37092487/8144506
    function awaitText(el){
      return new Promise((res,rej) => {
        if(el){
          if(el.textContent.trim() == ""){
            let textObsvr = new MutationObserver(mutations => {
              mutations.forEach(mutation => {
              [].every.call(mutation.addedNodes, (node) => {
                  if(node.textContent.trim() !== ""){
                    textObsvr.disconnect();
                    res(el.textContent)
                  }
                  return true
                })
              })
            })
            textObsvr.observe(el, { childList: true, subtree: true });
          } else { res(el.textContent) }			
        } else { rej() }
      })
    }

    // click func
    function clickedOn(el,cb){
      let isDragging = false;
      let startX, startY;
    
      document.addEventListener("mousedown", e => {
        startX = e.clientX;
        startY = e.clientY;
        isDragging = false;
      })
    
      document.addEventListener("mousemove", e => {
        let deltaX = Math.abs(e.clientX - startX);
        let deltaY = Math.abs(e.clientY - startY);
        deltaX > 5 || deltaY > 5 ? isDragging = true : ""
      })
    
      el.addEventListener("click", e => {
        if(isDragging){
          e.preventDefault();
        } else {
          cb && typeof cb == "function" ? cb() : null
        }
      })
    }
		
		/*------- SPEEDS, PARSED -------*/
    let startingDelayMS = 0;
    let textBlockFadeMS = 0;
    let charaSpeedMS = 0;
    let charaDelayMS = 0;
    let nextBtnSpeedMS = 0;
    let fadeOutSpeedTotalMS = 0;

    let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(!reducedMotion){
      if(charaSpeed && TYPE(charaSpeed) == "string" && charaSpeed.trim() !== "" && charaDelay && TYPE(charaDelay) == "string" && charaDelay.trim() !== ""){
        startingDelayMS = GETSPEED(startingDelay.trim());
        textBlockFadeMS = GETSPEED(selectorsFadeSpeed.trim());
        charaSpeedMS = GETSPEED(charaSpeed.trim());
        charaDelayMS = GETSPEED(charaDelay.trim());
        nextBtnSpeedMS = GETSPEED(nextBtnSpeed.trim());
        fadeOutSpeedTotalMS = Math.max(textBlockFadeMS,nextBtnSpeedMS)
      }
    }
		
		/*------- WRAPPER (TEXTS + NEXT BTN) -------*/
		let wrapperSel;
		if(wrapper){
			let t = TYPE(wrapper);
			
			// if: string
			t == "string" && t.trim() !== "" ?
			document.querySelectorAll(wrapper)?.forEach(t => t.setAttribute("text-bobber-wrapper","")) :
			
			// if: element (SINGLE)
			t.startsWith("html") && t.endsWith("element") ?
			wrapper.setAttribute("text-bobber-wrapper","") :
			
			// if: elements (MULTIPLE)
			t == "nodelist" &&
			wrapper?.forEach(t => t.setAttribute("text-bobber-wrapper",""))
			
			// deal with any cases of nested wrappers
			let oddCase = document.querySelectorAll("[text-bobber-wrapper] [text-bobber-wrapper]");
			oddCase?.forEach(x => x.removeAttribute("text-bobber-wrapper"))
		}//end: identify wrapper
		
		wrapperSel = document.querySelectorAll("[text-bobber-wrapper]:not(.ready)");
		wrapperSel?.forEach(wrapper => {
			/*------- ALL TEXTS (WRAPPER) -------*/
			// should only be single element
			if(textContainer){
				let a = TYPE(textContainer)
				
				// if: string
				a == "string" && a.trim() !== "" ?
				(wrapper.querySelector(textContainer) || "").setAttribute("text-bobber-texts","") :
				
				// if: element (SINGLE)
				a.startsWith("html") && a.endsWith("element") ?
				(wrapper.querySelector(textContainer) || "").setAttribute("text-bobber-texts","") :
				
				// if: elements (MULTIPLE), pick the first one only
				a == "nodelist" ?
				(wrapper.querySelector(textContainer[0]) || "").setAttribute("text-bobber-texts","") : null
			}

      /*------- NEXT BUTTON -------*/
      let nextBtnSel;
			if(TYPE(nextBtn) == "string"){
				nextBtnSel = wrapper.querySelector(nextBtn);
			} else if(nextBtn.startsWith("html") && selsType.endsWith("element")){
				nextBtnSel = nextBtn;
			} else if(TYPE(nextBtn) == "nodelist"){
				nextBtnSel = nextBtn[0];
			}
			
			// next button exists
			if(nextBtnSel){
				nextBtnSel.setAttribute("text-bobber-next-btn","")
			}//end: next button exists
			
			let allTextsWrap = wrapper?.querySelector("[text-bobber-texts]")
			if(wrapper && textContainer && allTextsWrap){
				
				/*------- EACH DIALOGUE TEXT -------*/
				if(selectors){
					/*----- ADD ORDER NUM TO EACH -----*/
					let selsType = TYPE(selectors)

					// if: string
					if(selsType == "string" && selsType.trim() !== ""){
						allTextsWrap.querySelectorAll(selectors)?.forEach((sel,i) => {
							sel.setAttribute("text-bobber","");
							sel.setAttribute("text-bobber-order",i+1);
						})
					}

					// if: element (SINGLE)
					else if(selsType.startsWith("html") && selsType.endsWith("element")){
						allTextsWrap.querySelector(selectors).setAttribute("text-bobber-order",1);
					}

					// if: elements (MULTIPLE)
					else if(selsType == "nodelist"){
						allTextsWrap.querySelectorAll(selectors)?.forEach((sel,i) => {
							sel.setAttribute("text-bobber","");
							sel.setAttribute("text-bobber-order",i+1);
						})
					}
					
					let allTexts = wrapper.querySelectorAll("[text-bobber]")
          let nextBtn = wrapper.querySelector("[text-bobber-next-btn]")
					
					/*----- DO STUFF WITH EACH TEXT -----*/
					allTexts?.forEach((text,textIndex) => {
						// only do stuff if it hasn't been done already
						if(!text.matches(".initialized")){
              awaitText(text).then(output => {
                // aria-label
                text.ariaLabel = text.textContent.trim();

                // wrap stray text nodes
                let nodeStack = [text];
                while(nodeStack.length > 0){
                  let currentNode = nodeStack.pop();
                  if(currentNode.nodeType === 3 && currentNode.data.trim().length > 0 && !currentNode.parentNode?.matches("span.temp-node")){
                    let span = document.createElement("span");
                    span.classList.add("temp-node");
                    currentNode.before(span);
                    span.appendChild(currentNode);
                  } else if(currentNode.childNodes.length > 0){
                    for(let i=currentNode.childNodes.length-1; i>=0; i--){
                      nodeStack.push(currentNode.childNodes[i]);
                    }
                  }
                }//end wrap text nodes
                
                // split each character
                text.querySelectorAll("span.temp-node")?.forEach(el => {
                  let html = Array.from(el.innerHTML);
                  
                  for(let i=0; i<html.length; i++){
                    // if contents only consists of a space
                    if(html[i].trim() == ""){
                      html[i] = `<span text-bobber-chara text-bobber-whitespace>${html[i]}</span>`
                    }

                    // if contents is not a space
                    else {
                      html[i] = `<span text-bobber-chara>${html[i]}</span>`
                    }
                  }

                  el.innerHTML = html.join("");
                })//end text >* foreach

                // remove .temp-node class when done
                text.querySelectorAll("span.temp-node")?.forEach(n => {
                  n.classList.value.trim() == "temp-node" ?
                  n.removeAttribute("class"):
                  n.classList.remove("temp-node")
                })
                
                // chara stats
                // i.e. chara count, total time needed to animate current dialogue
                let totalCharas;
                let totalDur;
                if(text.querySelector(charaSel)){
                  // character count (w/o spaces)
                  totalCharas = text.querySelectorAll(charaSel).length;
                  text.setAttribute("total-characters",totalCharas);
                  
                  // total transition duration
                  totalDur = (charaDelayMS*(totalCharas-1))+charaSpeedMS;
                  text.setAttribute("total-duration",`${totalDur}ms`)
                }
                
                // initial states
                // for all
                text.classList.add("hide")
                text.ariaHidden = true;
                text.classList.add("not-animated")
                height == "compact" ? text.style.display = "none" : ""
                
                // DON'T PUT ANYTHING AFTER THIS
                text.classList.add("initialized")
              })//end awaitText
						}//end: !has(.initialized)
						
					})//end [text-bobber] each

          /*------ SEND ME STRENGTH TO NOT K!LL MYSELF ------*/
          setTimeout(() => {
            let timeout; // will be updated and overridden as the bubbles go
            
            let bub1 = [...allTexts].find(x => x.getAttribute("text-bobber-order") == "1")
            let noDataCurrents = [...allTexts].find(x => typeof x.dataset.current == "undefined")
            if(bub1 && noDataCurrents){

              /*------ SHOW 1ST BUBBLE ------*/
              setTimeout(() => {
                // 1st bubble: add data-current
                bub1.dataset.current = ""

                // 1st bubble: show
                height == "compact" ? bub1.style.display = "" : ""
                bub1.classList.remove("hide")
                requestAnimationFrame(() => bub1.classList.add("show"))
                bub1.removeAttribute("aria-hidden")

                // 1st bubble: change animation state
                bub1.classList.remove("not-animated")
                bub1.classList.add("animating")

                // 1st bubble: animate the charas
                bub1.querySelectorAll(charaSel)?.forEach((chara,i) => {
                  setTimeout(() => {
                    chara.classList.add("bob-it")
                  },charaDelayMS*i)
                })

                // 1st bubble: update timeout value
                let bub1totaldur = GETSPEED(bub1.getAttribute("total-duration"))
                timeout = setTimeout(() => {
                  bub1.classList.remove("animating")
                  bub1.classList.add("animated")

                  // the following lines are only applicable to box 1
                  let hasNext = [...allTexts].find(x => x.matches(`[text-bobber-order="2"]`))
                  if(hasNext){
                    nextBtn.classList.add("show")
                  }                
                },bub1totaldur)
              },startingDelayMS)

              /*------ WRAPPER CLICK ------*/
              clickedOn(wrapper, () => {
                // find data-current
                let current = [...allTexts].find(x => typeof x.dataset.current !== "undefined")
                if(!current) return;
                let currentID = Number(current.getAttribute("text-bobber-order"))

                let nextID = currentID+1;
                let next = [...allTexts].find(x => x.matches(`[text-bobber-order="${nextID}"]`))

                /*------ STILL ANIMATING, STOP ANIMATING ------*/
                if(current.matches(".animating") && !current.matches(".animated")){
                  // current bubble: change animation state
                  current.classList.remove("animating")
                  current.classList.add("animated")

                  // next button:
                  if(next || (!next && loop == "yes" && currentID !== 1)){
                    nextBtn.classList.add("show")
                  }

                  // current bubble: stop all charas
                  current.querySelectorAll(charaSel)?.forEach((chara,i) => {
                    let clone = chara.cloneNode(true)
                    clone.classList.remove("bob-it")
                    clone.classList.add("show")
                    chara.after(clone)
                    chara.remove()
                  })

                  // current bubble: clearTimeout
                  clearTimeout(timeout)
                }

                /*------ DONE ANIMATING, GO TO NEXT ------*/
                else if(!current.matches(".animating") && current.matches(".animated")){
                  let nextTarget = next ? next : (loop == "yes" ? [...allTexts].find(x => x.matches(`[text-bobber-order="1"]`)) : null)
                  let nextTargetID = next ? nextID : 1

                  if(nextTarget){
                    // hide current [1/2]
                    current.classList.remove("show")
                    nextBtn.classList.remove("show")

                    // hide current [2/2]
                    setTimeout(() => {
                      current.removeAttribute("data-current")
                      current.classList.add("hide")
                      height == "compact" ? current.style.display = "none" : ""
                      current.ariaHidden = true

                      if(nextTargetID !== 1){
                        // if it CAN go next (NOT LOOP), shift it
                        current.style.marginLeft = "-100%"
                      } else {
                        // if at end + loop, reset all positions
                        allTexts?.forEach(t => {
                          t.style.marginLeft = ""
                        })
                      }

                      // replace charas
                      current.querySelectorAll(charaSel)?.forEach((chara,i) => {
                        let clone = chara.cloneNode(true)
                        clone.classList.remove("bob-it","show")
                        chara.after(clone)
                        chara.remove()
                      })

                      // reset animation state
                      current.classList.remove("animated")
                      current.classList.add("not-animated")

                      /*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

                      // next bubble: add data-current
                      nextTarget.dataset.current = ""

                      // next bubble: show
                      height == "compact" ? nextTarget.style.display = "" : ""
                      nextTarget.classList.remove("hide")
                      requestAnimationFrame(() => nextTarget.classList.add("show"))
                      nextTarget.removeAttribute("aria-hidden")

                      // next bubble: change animation state
                      nextTarget.classList.remove("not-animated")
                      nextTarget.classList.add("animating")

                      // next bubble: animate the charas
                      nextTarget.querySelectorAll(charaSel)?.forEach((chara,i) => {
                        setTimeout(() => {
                          chara.classList.add("bob-it")
                        },charaDelayMS*i)
                      })

                      // next bubble: update timeout value
                      let nextBubTotalDur = GETSPEED(nextTarget.getAttribute("total-duration"))
                      timeout = setTimeout(() => {
                        nextTarget.classList.remove("animating")
                        nextTarget.classList.add("animated")

                        let checkNext = [...allTexts].find(x => x.matches(`[text-bobber-order="${Math.floor(nextTargetID+1)}"]`))
                        if(checkNext || (!checkNext && loop == "yes" && currentID !== 1)){
                          nextBtn.classList.add("show")
                        }
                      },nextBubTotalDur)
                    },fadeOutSpeedTotalMS)
                  }//end: nextTarget exists/valid
                }//end: anim done, go next
              })//end onclick
            }
          },0)
					
				}//end selectors
			}//end: if [text-bobber-wrapper] && [text-bobber-texts]

      
			
			// DON'T PUT ANYTHING AFTER THIS
      wrapper.classList.add("ready")
		})//end [text-bobber-wrapper] each
		
		/*----- ADD CSS -----*/
		let findBobStyle = document.querySelector("style.text-bobber-css")
		if(!findBobStyle){
			let findBobStyle = document.createElement("style");
			findBobStyle.classList.add("text-bobber-css")
			findBobStyle.textContent = `[text-bobber-wrapper]{ --Text-Bobber-Dialogue-Fade-Speed:${textBlockFadeMS}ms; --Text-Bobber-Animation-Speed:${charaSpeedMS}ms; --Text-Bobber-Next-Arrow-Animation-Speed:${nextBtnSpeedMS}ms; } [text-bobber-texts]{ display:flex; overflow:hidden; } [text-bobber]{ width:100%; flex-shrink:0; visibility:hidden; opacity:0; transition:opacity var(--Text-Bobber-Dialogue-Fade-Speed) ease-in-out, visibility 0s var(--Text-Bobber-Dialogue-Fade-Speed) ease-in-out; } [text-bobber].show { visibility:visible!important; opacity:1!important; transition:opacity var(--Text-Bobber-Dialogue-Fade-Speed) ease-in-out, visibility 0s 0s ease-in-out; } [text-bobber-chara]{ opacity:0; } [text-bobber-chara].bob-it { opacity:1; transition:opacity var(--Text-Bobber-Animation-Speed) ease-in-out; } [text-bobber-chara].show { opacity:1; } [text-bobber-next-btn]{ visibility:hidden; opacity:0; transition:opacity var(--Text-Bobber-Next-Arrow-Animation-Speed) ease-in-out, visibility 0s var(--Text-Bobber-Next-Arrow-Animation-Speed) ease-in-out; } [text-bobber-next-btn].show { visibility:visible!important; opacity:1!important; transition:opacity var(--Text-Bobber-Next-Arrow-Animation-Speed) ease-in-out, visibility 0s 0s ease-in-out; }`
			document.head.append(findBobStyle)
		}
		
	}//end textBobberInit func
	
	/*----- EXECUTE -----*/
	document.readyState == "loading" ?
	document.addEventListener("DOMContentLoaded", () => textBobberInit(params)) :
	textBobberInit(params);
}//end textBobber func
