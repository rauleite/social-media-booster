chrome.runtime.onMessage.addListener(function (request, sender, callback) {
    let _sleepPostScrollTime = 6 * 1000 // 4
    let _followsLimit = (Math.floor(Math.random() * 20) + 140) //Limit 160
    let _timeBetweenFollowing = (Math.floor(Math.random() * 15) + 10) * 1000 // 10 à 25 secs

    // let _sleepPostScrollTime = 4 * 1000 // 4
    // let _followsLimit = 20
    // let _timeBetweenFollowing = 10 * 1000 // 15 à 30 secs

    const ENV = 'Prod'
    // const ENV = 'Dev'

    if (ENV !== 'Prod') {
        _sleepPostScrollTime = 4 * 1000 // 4
        _followsLimit = 40 //Limit 160
        _timeBetweenFollowing = 5 * 1000 // 20 à 40 secs
    }

    // let _$ = document.body.querySelector.bind(document)
    // let _$$ = document.body.querySelectorAll.bind(document)
    let _windowOrModal = window

    let _facebookDialogSetInterval = null

    let locationHref = window.location.href
    let testTwitterVersion = document.body.querySelector("div.ProfileCard-content")
    const HOST = {
        isInstagram: locationHref.includes('instagram'),
        isFacebook: locationHref.includes('facebook'),
        isTwitter: locationHref.includes('twitter') && !!testTwitterVersion,
        isTwitterNew: locationHref.includes('twitter') && !testTwitterVersion,
    }

    fixConsoleLog()

    initMediaConfigs()

    /**
     * Funcao recursiva que clica nos botoes de seguir
     * @param {Number} firstTimeBetween
     */
    async function main(qtdeAmigoAdicionado) {
        let delayClick = _timeBetweenFollowing
        // Sleep para que seja 'computado' os elementos pós scroll
        let buttonElem = getButtonElement()
        console.log("TCL: main -> buttonElem", buttonElem)

        console.log("TCL: main -> buttonElem", !!buttonElem)

        console.log(1)

        if (shouldEndProgram(qtdeAmigoAdicionado)) return // continua ou encerra recursividade

        if (!buttonElem) {
            console.log(2)
            // (continue) continua recursividade
            return scrollToBottom(qtdeAmigoAdicionado)
        }

        ++qtdeAmigoAdicionado

        buttonElem = await beforeClick(buttonElem)

        console.log(`Adicionado ${qtdeAmigoAdicionado}`)

        console.log(3)
        if (ENV === 'Prod') {
            buttonElem.click()
        } else {
            buttonElem.remove()
            console.log("TCL: main -> buttonElem", buttonElem)
        }

        buttonElem = await afterClick(buttonElem)

        console.log("TCL: main -> ", 'Esperando para próximo clique...')
        await sleep(delayClick)


        main(qtdeAmigoAdicionado)
    }

    /**
     * Obtem o elemento do botão correto, para clicar
     * @param {Function} callback 
     */
    function getButtonElement(callback) {
        if (HOST.isInstagram) {
            // o primeiro (índice 0) sempre será o de fechar e não há seletor simples, para descartá-lo

            let elem = document.body.querySelectorAll("div[role='dialog'] button")


            if (elem.length) {
                // Converte de NodeList para Array
                elem = Array.prototype.slice.call(elem)

                elem = elem.find((e) => {
                    let result = e.innerText.match('Seguir') || e.innerText.match('Follow')
                    return result
                })

            }

            // console.log("TCL: getButtonElement -> elem", elem)
            return elem
        } else if (HOST.isFacebook) {

            let elem = document.body.querySelector("div#content button.FriendRequestAdd:not(.hidden_elem)")

            return elem
        } else if (HOST.isTwitter) {
            return document.body.querySelector("div.GridTimeline-items.has-items div.not-following button.follow-text")
        } else if (HOST.isTwitterNew) {
            return document.body.querySelector("div[aria-label*='Timeline:'] div[data-testid*='-follow']")
        } else {
            window.alert('😱 SITE NÃO SUPORTADO.\nCertifique que está na página de seguidores.\nQualquer coisa, contate-me.')
        }
    }

    /**
     * Encerra o programa ou então continua a recursividade
     * @param {Number} qtdeAmigoAdicionado 
     */
    function shouldEndProgram(qtdeAmigoAdicionado) {
        // Continua recursividade
        if (qtdeAmigoAdicionado <= _followsLimit) return

        // Finaliza recursividade
        clear()

        if (ENV === 'Prod') {
            window.alert('Finalizando a fila, continue amanhã neste site\n🚀Adicionado ' + (qtdeAmigoAdicionado - 1) + ' amigos.')
        } else {
            console.log('Adicionado ' + (qtdeAmigoAdicionado - 1) + ' amigos.')
        }
        return true
    }

    /**
     * Faz o scroll para o final da página
     * @param {Number} qtdeAmigoAdicionado 
     */
    async function scrollToBottom(qtdeAmigoAdicionado) {
        _windowOrModal.scroll(0, 0) // hack insta modal (resolve problema de reflow - redesenho de página)
        _windowOrModal.scroll(1, document.body.scrollHeight * 10) // insta modal

        console.log('Scroll foi ativado, esperando...')

        // continua recursividade
        await sleep(_sleepPostScrollTime)
        main(qtdeAmigoAdicionado)
    }

    function clear() {
        clearInterval(_facebookDialogSetInterval)
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function beforeClick(buttonElem) {
        console.log("TCL: beforeClick -> beforeClick")
        let resultButtonElem = buttonElem
        if (HOST.isInstagram) {
        } else if (HOST.isFacebook) {
        } else if (HOST.isTwitter) {
        } else if (HOST.isTwitterNew) {
        } else {
        }
        console.log("TCL: beforeClick -> resultButtonElem", resultButtonElem)
        return resultButtonElem
    }

    async function afterClick(buttonElem) {
        console.log("TCL: afterClick -> afterClick")
        let hadSleep = false
        let resultButtonElem = buttonElem
        if (HOST.isInstagram) {
        } else if (HOST.isFacebook) {
            // Quando o perfil tem o limite de 5000 amigos, o facebook nao deixa clicar
            // e o botão não muda seu estado, assim o programa fica empatado, clicando sem no mesmo botao
            let dialogLimiteDeAmigos = document.body.querySelector("div[data-testid='exception_dialog'] a[action='cancel']")
            console.log("TCL: beforeClick -> dialogLimiteDeAmigos", dialogLimiteDeAmigos)
            if (dialogLimiteDeAmigos) {
                await sleepAfterClick()
                dialogLimiteDeAmigos.click()
                resultButtonElem.remove()
                resultButtonElem = getButtonElement()
            }

            // Menu apos clique no botao
            // Remove diálogo do botao, ao clicar
            let dialogAdd = document.body.querySelector("div.uiContextualLayer")
            if (dialogAdd) {
                await sleepAfterClick()
                // Nao parece estar dando certo, mas nao tem problema deixar o menu ativado
                dialogAdd.remove()
            }

            // Recomendacao sobre adicionar apenas amigo conhecido
            let dialogRecomendationButton = document.body.querySelector("div[role='dialog'] a.layerCancel")
            if (dialogRecomendationButton) {
                await sleepAfterClick()

                // NodeList to Array
                // dialogRecomendationButton = Array.prototype.slice.call(dialogRecomendationButton)
                // dialogRecomendationButton.every((elem) => {
                //     if (elem.innerText === 'Confirm') {
                dialogRecomendationButton.click()
                // return false // break
            }
            // })

            // }
        } else if (HOST.isTwitter) {
        } else if (HOST.isTwitterNew) {
        } else {
        }
        async function sleepAfterClick() {
            if (!hadSleep) {
                console.log("TCL: afterClick -> 'antes sleep'", 'antes sleep')
                await sleep(_sleepPostScrollTime / 2)
                console.log("TCL: afterClick -> 'depois sleep'", 'depois sleep')
                hadSleep = true
            }
        }
        return resultButtonElem
    }


    /**
     * FUNCOES QUE ATUAM MAIS COMO LIB
     */

    /**
     * Resolve o problema de alguns sites, como o old Twitter que não aceitam console.log
     */
    function fixConsoleLog() {
        var frame = document.createElement('iframe');
        document.body.appendChild(frame);
        console = frame.contentWindow.console
    }

    // Instagram precisa de configurações prévias
    async function initMediaConfigs() {
        if (HOST.isInstagram) {
            let clickDelayTime = 4000
            // Abre Modal e scrolla até a metade para carregar o resto
            document.body.querySelector("a[href*='followers']").click()
            // Desnecessário mas melhor
            await sleep(clickDelayTime) //aguarda modal abrir
            let modal = document.body.querySelector("div.isgrP")
            modal.style.scrollBehavior = 'smooth'
            modal.scroll(0, 500) // necessário para carregar restante 
            _windowOrModal = modal
            main(0)
        } else if (HOST.isFacebook) {
            // Desabilita um aviso assim que aparece
            _facebookDialogSetInterval = setInterval(() => {
                // document.body.querySelector('div').click()

                // let dialog = document.body.querySelector("div[aria-label='Dialog content']")
                // if (dialog) {
                //     let dialogButton = dialog.getElementsByTagName('a')[0]
                //     if (dialogButton.getAttribute('action') === 'cancel') {
                //         dialogButton.click()
                //     }
                // }
                // // Remove diálogo do botao, ao clicar
                // let dialogAdd = document.body.querySelector("div.uiContextualLayer")
                // if (dialogAdd) { document.body.click() }

            }, 1000)
            main(0)
        } else if (HOST.isTwitter) {
            // _followsLimit = (Math.floor(Math.random() * 20) + 40) //Limit 60
            // _timeBetweenFollowing = (Math.floor(Math.random() * 30) + 110) * 1000 // 110 à 140 secs
            main(0)
        } else if (HOST.isTwitterNew) {
            // _followsLimit = (Math.floor(Math.random() * 20) + 40) //Limit 60
            // _timeBetweenFollowing = (Math.floor(Math.random() * 30) + 110) * 1000 // 110 à 140 secs
            main(0)
        }
    }
})