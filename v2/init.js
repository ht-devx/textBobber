/*----------------------------------------------------
                                                        
      textBobber() by @ht-devx
      * visual novel typewriter effect plugin
      * github.com/ht-devx/textBobber
      * v2.0.0 [2025-02-10]
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
		let loop = params.loop;

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

    function hideCurrentAndShowNext(current,currentIndex,next,nextBtn){
      if(current){
        // move 'current' (prev) out of view
        current.style.marginLeft = "-100%"
        current.ariaHidden = true
      }      

      // update data-current
      current && current.removeAttribute("data-current")
      next.dataset.current = ""

      // show next
      next.classList.add("show")
      next.removeAttribute("aria-hidden")

      // update animation state
      next.classList.remove("not-animated")
      next.classList.add("animating")

      // replace all charas
      next.querySelectorAll(charaSel)?.forEach(chara => {
        let clone = chara.cloneNode(true)
        clone.classList.remove("bob-it","show")
        chara.after(clone)
        chara.remove()
      })

      // animate the (new) charas
      next.querySelectorAll(charaSel)?.forEach((chara,i) => {
        setTimeout(() => {
          chara.classList.add("bob-it")
        },charaDelayMS*i)
      })

      // after the charas are done animating,
      // (assuming that the user didn't click it)
      let totalDur = GETSPEED(next.getAttribute("total-duration"))
      setTimeout(() => {
        // automatically end the animation state
        if(next.matches(".animating")){
          next.classList.remove("animating")

          if(!next.matches(".animated")){
            next.classList.add("animated")
          }

          // show next button
          // 0. reassign 'next' as the one AFTER supposed next (bc we're doing an auto timeout rather than manual)
          // only if A. can go next
          // or B. no next, but user wants to loop
          // C. there is more than 1 text bubble
          next = next.nextElementSibling && next.nextElementSibling.matches("[text-bobber-order]") ? next.nextElementSibling : undefined

          if(next || (!next && (loop === true || loop == "true") && currentIndex !== 1)){
            nextBtn.classList.add("show")
          }
        }
      },totalDur)
    }//end func
		
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
					
					/*----- WRAPPER CLICK -----*/
          clickedOn(wrapper, () => {
						let currentItem = [...allTexts].find(x => typeof x.dataset.current !== "undefined")
						let currentIndex = currentItem && Number(currentItem.getAttribute("text-bobber-order"))
						let hasCurrent = [currentItem, currentIndex].every(v => typeof v !== "undefined") && !isNaN(currentIndex);
            
            if(hasCurrent){
							let current = currentItem;
							let next = currentItem.nextElementSibling && currentItem.nextElementSibling.matches("[text-bobber-order]") ? currentItem.nextElementSibling : undefined
              
              /*---- 🍊🍊🍊 STILL GOING, STOP THE ANIM 🍊🍊🍊 ----*/
              if(current.matches(".animating") && !current.matches(".animated")){
                // remove "animating" state
                current.classList.remove("animating");

                // force charas to stop animating
                current.querySelectorAll(charaSel)?.forEach(chara => {
                  let clone = chara.cloneNode(true)
                  clone.classList.remove("bob-it")
                  clone.classList.add("show")
                  chara.after(clone)
                  chara.remove()
                })

                // add "animated" end state
                requestAnimationFrame(() => {
                  current.classList.add("animated")
                })

                // show next button
                if(nextBtn && !nextBtn.matches(".show")){
                  // only if A. can go next
                  // or B. no next, but user wants to loop
                  // C. there is more than 1 text bubble
                  if(next || (!next && (loop === true || loop == "true") && currentIndex !== 1)){
                    nextBtn.classList.add("show")
                  }
                }
              }//end: manual stop

              /*---- 🍐🍐🍐 ANIM DONE, GO NEXT 🍐🍐🍐 ----*/
              else if(!current.matches(".animating") && current.matches(".animated")){
                // check for any remaining bob-it charas
                // force remaining charas to stop animating
                if(current.querySelector(`${charaSel}.bob-it`)){
                  current.querySelectorAll(charaSel)?.forEach(chara => {
                    let clone = chara.cloneNode(true)
                    clone.classList.remove("bob-it")
                    clone.classList.add("show")
                    chara.after(clone)
                    chara.remove()
                  })
                }

                /*------ CAN GO NEXT ------*/
                if(next){
                  // FADE OUT current
                  requestAnimationFrame(() => {
                    [current,nextBtn]?.forEach(x => x.classList.remove("show"))
                  })

                  // stuff to do AFTER fade-out
                  setTimeout(() => {
                    hideCurrentAndShowNext(current,currentIndex,next,nextBtn)
                  },fadeOutSpeedTotalMS)
                }//end: CAN go next

                /*------ 🍅🍅🍅 RETURN TO BEGINNING 🍅🍅🍅 ------*/
                else {
                  // if user enables loop, also make sure that there isn't just ONE bubble
                  // (looping 1 bubble makes no sense)
                  if((loop === true || loop == "true") && currentIndex !== 1){
                    // reset all positions
                    allTexts?.forEach((text,textIndex) => {
                      text.classList.remove("show","animated")
                      nextBtn && nextBtn.classList.remove("show")

                      requestAnimationFrame(() => {
                        text.classList.add("not-animated")
                      })

                      setTimeout(() => {
                        text.ariaHidden = true;
                        text.style.marginLeft = ""

                        // remove all data-current
                        text.removeAttribute("data-current")
                        
                        /*------- LOOP, SHOW THE 1ST -------*/
                        if(textIndex == 0){
                          hideCurrentAndShowNext(null,1,text,nextBtn)
                        }//end: 1st one
                        
                      },fadeOutSpeedTotalMS)
                    })
                  }
                }//end: CANNOT go next
                
              }//end: auto stop
							
						}//end find [data-current]
					})//end wrapper click
					
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
                text.ariaHidden = true;
                text.classList.add("not-animated")

                /*------- SHOW THE 1ST ONE, ON LOAD -------*/
                if(textIndex == 0){
                  setTimeout(() => {
                    hideCurrentAndShowNext(null,1,text,nextBtn)
                  },startingDelayMS)
                }//end: 1st one
                
                // DON'T PUT ANYTHING AFTER THIS
                text.classList.add("initialized")
              })//end awaitText
						}//end: !has(.initialized)
						
					})//end [text-bobber] each
					
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
			findBobStyle.textContent = `
				[text-bobber-wrapper]{
					--Text-Bobber-Dialogue-Fade-Speed:${textBlockFadeMS}ms;
					--Text-Bobber-Animation-Speed:${charaSpeedMS}ms;
					--Text-Bobber-Next-Arrow-Animation-Speed:${nextBtnSpeedMS}ms;
				}
				
				[text-bobber-texts]{
					display:flex;
					overflow:hidden;
				}
				
				[text-bobber]{
					width:100%;
					flex-shrink:0;
					visibility:hidden;
					opacity:0;
					transition:opacity var(--Text-Bobber-Dialogue-Fade-Speed) ease-in-out, visibility 0s var(--Text-Bobber-Dialogue-Fade-Speed) ease-in-out;
				}
				
				[text-bobber].show {
					visibility:visible!important;
					opacity:1!important;
					transition:opacity var(--Text-Bobber-Dialogue-Fade-Speed) ease-in-out, visibility 0s 0s ease-in-out;
				}
				
				[text-bobber-chara]{
					opacity:0;
				}
				
				[text-bobber-chara].bob-it {
					opacity:1;
					transition:opacity var(--Text-Bobber-Animation-Speed) ease-in-out;
				}
				
				[text-bobber-chara].show {
					opacity:1;
				}
				
				[text-bobber-next-btn]{
					visibility:hidden;
					opacity:0;
					transition:opacity var(--Text-Bobber-Next-Arrow-Animation-Speed) ease-in-out, visibility 0s var(--Text-Bobber-Next-Arrow-Animation-Speed) ease-in-out;
				}
				
				[text-bobber-next-btn].show {
					visibility:visible!important;
					opacity:1!important;
					transition:opacity var(--Text-Bobber-Next-Arrow-Animation-Speed) ease-in-out, visibility 0s 0s ease-in-out;
				}
			`
			document.head.append(findBobStyle)
		}
		
	}//end textBobberInit func
	
	/*----- EXECUTE -----*/
	document.readyState == "loading" ?
	document.addEventListener("DOMContentLoaded", () => textBobberInit(params)) :
	textBobberInit(params);
}//end textBobber func
