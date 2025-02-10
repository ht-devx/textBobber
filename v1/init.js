/*----------------------------------------------------
                                                        
      textBobber() by @glenthemes
      * visual novel typewriter effect plugin
      * github.com/ht-devx/textBobber
      2024 | All Rights Reserved

-----------------------------------------------------*/

window.textBobber = function(params){
	let textBobberInit = (params) => {
        
		/*----------- PARAMETERS -----------*/
        let wrapper = params.wrapper;
        let startingDelay = params.initialDelay;
		let selectors = params.textSelectors;
        let selectorsFadeSpeed = params.textSelectorsFadeSpeed;
		let charaSpeed = params.characterAnimationSpeed;
		let charaDelay = params.characterDelay;
        let nextBtn = params.nextButton;
        let nextBtnSpeed = params.nextButtonAnimationSpeed;
		
        /*------- GENERIC FUNCS -------*/
		function TYPE(x){
			return ({}).toString.call(x).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
		}

        function GETSPEED(s){
            let res;
            let nums = Number(s.replace(/[^\d\.]*/g,""));
            let units = s.toLowerCase().replace(/[^a-z]/g,"");
            units == "s" ? res = nums*1000 : res = nums;
            return res
        }

        function CSS(el,prop){
            let finalVal;

            let inlineVal = el.style[`${prop}`];
            let embeddedVal = getComputedStyle(el).getPropertyValue(`${prop}`);

            finalVal = inlineVal == "" ? embeddedVal : inlineVal;

            return finalVal
        }//end pos function

        /*------- SPEEDS, PARSED -------*/
        let startingDelayMS = 0;
        let textBlockFadeMS = 0;
        let charaSpeedMS = 0;
        let charaDelayMS = 0;
        let nextBtnSpeedMS = 0;

        let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if(!reducedMotion){
            if(charaSpeed && TYPE(charaSpeed) == "string" && charaSpeed.trim() !== "" && charaDelay && TYPE(charaDelay) == "string" && charaDelay.trim() !== ""){
                startingDelayMS = GETSPEED(startingDelay.trim());
                textBlockFadeMS = GETSPEED(selectorsFadeSpeed.trim());
                charaSpeedMS = GETSPEED(charaSpeed.trim());
                charaDelayMS = GETSPEED(charaDelay.trim());
                nextBtnSpeedMS = GETSPEED(nextBtnSpeed.trim());
            }
        }

        /*------- STORE HEIGHTS -------*/
        let textHeights = [];

        /*------- ANCESTOR WRAPPER -------*/
        if(wrapper){
			let wrapperType = TYPE(wrapper)
			
			// if: string
			if(wrapperType == "string" && wrapperType.trim() !== ""){
				if(document.querySelector(wrapper)){
                    document.querySelector(wrapper).setAttribute("text-bobber-wrapper","");
				}
			}

			// if: element (SINGLE)
			else if(wrapperType.startsWith("html") && wrapperType.endsWith("element")){
				wrapper.setAttribute("text-bobber-wrapper","");
			}

            // if: elements (MULTIPLE)
            else if(wrapperType == "nodelist"){
                document.querySelectorAll(wrapper)?.forEach(sel => {
                    sel.setAttribute("text-bobber-wrapper","");
                })
            }
		}//end wrapper
		
		/*------- TEXT BOBBER SELECTOR(S) -------*/
		if(selectors){
			let selsType = TYPE(selectors)
			
			// if: string
			if(selsType == "string" && selsType.trim() !== ""){
				if(document.querySelector(selectors)){
					document.querySelectorAll(selectors)?.forEach((sel,i) => {
                        i += 1;
						sel.setAttribute("text-bobber","");
                        sel.setAttribute("text-bobber-order",i);
					})
				}
			}

			// if: element (SINGLE)
			else if(selsType.startsWith("html") && selsType.endsWith("element")){
				selectors.setAttribute("text-bobber","");
                sel.setAttribute("text-bobber-order",1);
			}

            // if: elements (MULTIPLE)
            else if(selsType == "nodelist"){
                document.querySelectorAll(selectors)?.forEach((sel,i) => {
                    i += 1;
                    sel.setAttribute("text-bobber","");
                    sel.setAttribute("text-bobber-order",i);
                })
            }
		}//end selectors

        /*------ CHECK IF ANCESTOR HAS CHILD ------*/
        document.querySelectorAll("[text-bobber-wrapper]")?.forEach(wrapper => {
            if(wrapper.querySelector("[text-bobber]")){
                wrapper.setAttribute("has-bobs","");

                if(wrapper.querySelector("[text-bobber-order]:not([text-bobber-order=''])")){
                    wrapper.setAttribute("current-text",1);

                    // PASSES THE CHECK

                    /*------- NEXT BUTTON -------*/
                    let nextBtnSel;
                    if(TYPE(nextBtn) == "string"){
                        nextBtnSel = wrapper.querySelector(nextBtn);
                    } else if(nextBtn.startsWith("html") && selsType.endsWith("element")){
                        nextBtnSel = nextBtn;
                    } else if(TYPE(nextBtn) == "nodelist"){
                        nextBtnSel = nextBtn[0];
                    }

                    nextBtnSel.style.setProperty("--Text-Bobber-Next-Arrow-Animation-Speed",`${nextBtnSpeedMS}ms`);

                    function showNextArrow(){
                        if(nextBtnSel){
                            !nextBtnSel.matches(".show") ? nextBtnSel.classList.add("show") : ""
                        }
                    }

                    function hideNextArrow(){
                        if(nextBtnSel){
                            nextBtnSel.matches(".show") ? nextBtnSel.classList.remove("show") : ""
                        }
                    }

                    /*------- END CURRENT TEXT -------*/
                    function END_CURRENT_TEXT(currentTxt){
                        if(!currentTxt.matches(".end")){
                            currentTxt.classList.add("end");

                            let charaSel = "span[text-bobber-chara]:not([text-bobber-whitespace])";
                            currentTxt.querySelectorAll(charaSel)?.forEach((chara,i) => {
                                if(!chara.matches(".bob-it")){
                                    chara.classList.add("bob-it")
                                }
                            })

                            let orderNum = Number(currentTxt.getAttribute("text-bobber-order"));
                            let nextItem = wrapper.querySelector(`[text-bobber][text-bobber-order='${orderNum+1}']`);
                            nextItem ? showNextArrow() : ""
                        }//end: if NOT .end
                    }        

                    /*------- GO TO NEXT TEXT -------*/
                    function NEXT_TEXT(input){
                        let prev = Number(input.current);
                        if(!isNaN(prev)){
                            let prevText = wrapper.querySelector(`[text-bobber][text-bobber-order='${prev}']`);
                            prevText ? prevText.classList.remove("show") : "";
                            
                            let next = prev+1;
                            bob(`[text-bobber][text-bobber-order="${next}"]`);
                        }
                    }

                    /*------- BOB? -------*/
                    function bob(zel){
                        if(wrapper.querySelector(zel)){
                            let text = wrapper.querySelector(zel);
                            let orderNum = Number(text.getAttribute("text-bobber-order")) || 1;

                            if(orderNum == 1){
                                text.classList.add("show");
                            } else if(orderNum > 1){
                                setTimeout(() => {
                                    text.classList.add("show");
                                },textBlockFadeMS)
                            }

                            wrapper.setAttribute("current-text",orderNum);

                            setTimeout(() => {
                                hideNextArrow();
                            },0);

                            /*------ ANIMATE THE CHARACTERS ------*/
                            let charaSel = "span[text-bobber-chara]:not([text-bobber-whitespace])";
                            if(text.querySelector(charaSel)){
                                // total character count
                                // (without spaces)
                                let totalCharas = text.querySelectorAll(charaSel).length;
                                text.setAttribute("total-characters",totalCharas);

                                // instead of using css transition-delay,
                                // use setTimeout to delay WHEN the "appear" class gets added for each chara
                                text.querySelectorAll(charaSel)?.forEach((chara,i) => {
                                    setTimeout(() => {
                                        chara.classList.add("bob-it")
                                    },charaDelayMS*i)
                                })

                                // total transition duration
                                // i.e. estimated animation end time
                                let totalDur = (charaDelayMS * (totalCharas - 1)) + charaSpeedMS;
                                setTimeout(() => {
                                    END_CURRENT_TEXT(text);
                                },totalDur)
                            }//end: if there are characters to activ
                            

                            wrapper.addEventListener("click", () => {
                                // not ended yet, so end it
                                if(!text.matches(".end")){
                                    END_CURRENT_TEXT(text);
                                }

                                // ended already, can go next (if there is one)
                                else {
                                    if(!text.matches(".pseudo-ended")){
                                        if(wrapper.querySelector(`[text-bobber][text-bobber-order='${orderNum+1}']`)){
                                            NEXT_TEXT({ current: orderNum });
                                        }

                                        text.classList.add("pseudo-ended");
                                    }
                                }
                            })
                        }//end: check if zel exists
                    }//end bob

                    /*------- 1ST -------*/
                    setTimeout(() => {
                        bob("[text-bobber][text-bobber-order='1']");
                    },startingDelayMS);
                }//end: passes the check
            }//end: if ancestor has [text-bobber]
        })//end: ancestor each

        

        /*------- INITIALIZE TEXT -------*/
        document.querySelectorAll("[text-bobber]")?.forEach(text => {
            if(!text.matches(".text-bobbed")){

                /*------- CURRENT: HEIGHT -------*/
                let curHeight = text.offsetHeight;
                textHeights.push(curHeight);

                /*------- DIALOGUE FADE SPEED -------*/
                text.style.setProperty("--Text-Bobber-Dialogue-Fade-Speed",`${textBlockFadeMS}ms`);

                /*------- ARIA-LABEL -------*/
                text.ariaLabel = text.textContent.trim();

                /*----- ADD ANIM SPEED AS CSS VAR -----*/
                text.style.setProperty("--Text-Bobber-Animation-Speed",`${charaSpeedMS}ms`);

                /*----- WRAP STRAY NODES -----*/
                let stack = [text];
                while(stack.length > 0){
                    let currentNode = stack.pop();
                    if(currentNode.nodeType === 3 && currentNode.data.trim().length > 0 && !currentNode.parentNode?.matches("span.temp-node")){
                        let span = document.createElement("span");
                        span.classList.add("temp-node");
                        currentNode.before(span);
                        span.appendChild(currentNode);
                    } else if(currentNode.childNodes.length > 0){
                        for(let i=currentNode.childNodes.length-1; i>=0; i--){
                            stack.push(currentNode.childNodes[i]);
                        }
                    }
                }

                /*------ SPLIT EACH CHARACTER ------*/
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
                })//end >* foreach

                /*------- REMOVE .temp-node WHEN DONE -------*/
                text.querySelectorAll("span.temp-node")?.forEach(el => {
                    let _class = el.classList.value;
                    if(_class.trim() == "temp-node"){
                        el.removeAttribute("class")
                    } else {
                        el.classList.remove("temp-node")
                    }
                })

                // DONT PUT ANYTHING AFTER THIS
                text.classList.add("text-bobbed");
            }
        })//end [text-bobber] each (init)

        /*------- TALLEST HEIGHT -------*/
        let tallest = Math.max(...textHeights);

        document.querySelectorAll("[text-bobber]")?.forEach(text => {
            text.setAttribute("initialized","");

            let textParent = text.parentElement;
            if(!(CSS(textParent,"position") == "relative" || CSS(textParent,"position") == "absolute" || CSS(textParent,"position") == "fixed")){
                textParent.style.position = "relative";
            }

            !textParent.matches("[text-bobber-parent]") ? textParent.setAttribute("text-bobber-parent","") : ""
            textParent.style.setProperty("--Text-Bobber-Max-Height",`${tallest}px`);
        })

        function dialogueHeights(){
            // clear existing height vals
            textHeights = [];

            document.querySelectorAll("[text-bobber-parent]")?.forEach(parent => {
                // remove parent height cap
                parent.style.removeProperty("--Text-Bobber-Max-Height","");

                parent.querySelectorAll("[text-bobber]")?.forEach(text => {
                    if(text.matches("[initialized]")){
                        // remove pos:absolute to calculate new item height
                        text.removeAttribute("initialized");

                        // get resized item height
                        let curHeight = text.offsetHeight;
                        textHeights.push(curHeight);

                        // add pos:absolute back
                        text.setAttribute("initialized","");
                    }
                })

                // set new TALLEST item height as the height cap of text parent
                // (the one with pos:rel)
                let newHeight = Math.max(...textHeights);
                parent.style.setProperty("--Text-Bobber-Max-Height",`${newHeight}px`);
            })
        }

        /*------- RECALC HEIGHTS -------*/
        let sujnt = Date.now();
        let plrnt = 3000;
        let iprvs = setInterval(() => {
            if(Date.now() - sujnt > plrnt){
                clearInterval(iprvs);
                dialogueHeights();
            } else {
                if(document.readyState == "loading"){
                    dialogueHeights();
                } else {
                    clearInterval(iprvs)
                    dialogueHeights();
                }
            }
        },0)

        Promise.all([...document.scripts].filter(s => !s.complete).map(s => new Promise(resolve => {
            s.onload = s.onerror = resolve;
        }))).then(() => {
            dialogueHeights();
        });

        let userEvts = ["mouseenter", "mouseover", "click", "keydown", "scroll", "touchstart"];
        function once(){
            dialogueHeights();
            
            userEvts.forEach(e => {
                window.removeEventListener(e, once);
            })
        }
        userEvts.forEach(e => {
            window.addEventListener(e, once, { once: true })
        })

        window.addEventListener("resize", () => {
            dialogueHeights()
        })
	}//end textBobberInit
	
	/*----- EXECUTE -----*/
	document.readyState == "loading" ?
	document.addEventListener("DOMContentLoaded", () => textBobberInit(params)) :
	textBobberInit(params);
}//end textBobber
