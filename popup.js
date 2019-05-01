let _sleepPostScrollTime = 4 * 1000 // 4
let _followsLimit = (Math.floor(Math.random() * 20) + 140) //Limit 160
let _timeBetweenFollowing = (Math.floor(Math.random() * 15) + 15) * 1000 // 15 à 30 secs

// let _sleepPostScrollTime = 4 * 1000 // 4
// let _followsLimit = 20
// let _timeBetweenFollowing = 10 * 1000 // 15 à 30 secs

const ENV = 'Prod'
// const ENV = 'Dev'

if (ENV !== 'Prod') {
    _sleepPostScrollTime = 3 * 1000 // 4
    _followsLimit = 15 //Limit 160
    _timeBetweenFollowing = 5 * 1000 // 20 à 40 secs
}

let _$ = $
let _$$ = $$
let _windowOrModal = window

let _facebookDialogSetInterval = null

let locationHref = window.location.href
let testTwitterVersion = _$("div.ProfileCard-content")
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

    console.log("TCL: main -> buttonElem", !!buttonElem)

    console.log(1)

    if (shouldEndProgram(qtdeAmigoAdicionado)) return // continua ou encerra recursividade

    if (!buttonElem) {
        console.log(2)
        // (continue) continua recursividade
        return scrollToBottom(qtdeAmigoAdicionado)
    }

    ++qtdeAmigoAdicionado

    console.log(`Adicionado ${qtdeAmigoAdicionado}`)

    console.log(3)
    console.log(4)
    if (ENV === 'Prod') {
        buttonElem.style.borderStyle = 'solid'
        buttonElem.click()
    } else {
        buttonElem.style.borderStyle = 'solid'
        buttonElem.remove()
        console.log("TCL: main -> buttonElem", buttonElem)
    }
    console.log("TCL: main -> ", 'resolveu elemento, esperando...')
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
        return _$$("div[role='dialog'] button").find((elem) => {
            let result = elem.innerText.match('Seguir') || elem.innerText.match('Follow')
            return result
        })

    } else if (HOST.isFacebook) {
        return _$("button.FriendRequestAdd:not(.hidden_elem)")
    } else if (HOST.isTwitter) {
        return _$("div.GridTimeline-items.has-items div.not-following button.follow-text")
    } else if (HOST.isTwitterNew) {
        return _$("div[aria-label*='Timeline:'] div[data-testid*='-follow']")
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
        window.alert('Finalizando a fila, continue amanhã neste site\n🚀Adicionado ' + qtdeAmigoAdicionado - 1 + ' amigos.')
    } else {
        console.log('Adicionado ' + qtdeAmigoAdicionado - 1 + ' amigos.')
    }
    return true
}

/**
 * Faz o scroll para o final da página
 * @param {Number} qtdeAmigoAdicionado 
 */
async function scrollToBottom(qtdeAmigoAdicionado) {
    _windowOrModal.scroll(0, 0) // hack insta modal (resolve problema de reflow - redesenho de página)
    _windowOrModal.scroll(1, document.body.scrollHeight * 4) // insta modal

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
        _$("a[href*='followers']").click()
        // Desnecessário mas melhor
        await sleep(clickDelayTime) //aguarda modal abrir
        let modal = _$("div.isgrP")
        modal.style.scrollBehavior = 'smooth'
        modal.scroll(0, 500) // necessário para carregar restante 
        _windowOrModal = modal
        main(0)
    } else if (HOST.isFacebook) {
        // Desabilita um aviso assim que aparece
        _facebookDialogSetInterval = setInterval(() => {
            let dialog = _$("div[aria-label='Dialog content']")
            if (dialog) {
                let dialogButton = dialog.getElementsByTagName('a')[0]
                if (dialogButton.getAttribute('action') === 'cancel') {
                    dialogButton.click()
                }
            }

        }, 1000)
        main(0)
    } else if (HOST.isTwitter) {
        _followsLimit = (Math.floor(Math.random() * 20) + 40) //Limit 60
        _timeBetweenFollowing = (Math.floor(Math.random() * 30) + 110) * 1000 // 110 à 140 secs
        main(0)
    } else if (HOST.isTwitterNew) {
        _followsLimit = (Math.floor(Math.random() * 20) + 40) //Limit 60
        _timeBetweenFollowing = (Math.floor(Math.random() * 30) + 110) * 1000 // 110 à 140 secs
        main(0)
    }
}