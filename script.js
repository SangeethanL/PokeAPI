let loadedPokemons = [];

let openedCard;
let searchedCard;
let openedSearchedCard;

let about;
let baseStats;

let loadMoreQuantitiy = 10;
getItem();
let increaseStartInAPI = loadMoreQuantitiy;

function checkIfLoaded() {
    if (loadedPokemons.length !== increaseStartInAPI && searchedCard == null) {
        document.getElementById('input').style = 'pointer-events:none;';
        document.getElementById('search').style = 'pointer-events:none;';
        document.getElementById('reset').style = 'pointer-events:none;';
        document.getElementById('pokemons').style = 'pointer-events:none;';
        document.getElementById('loadMore').style = 'pointer-events:none;';
    }
    else {
        document.getElementById('input').style = '';
        document.getElementById('search').style = '';
        document.getElementById('reset').style = '';
        document.getElementById('pokemons').style = '';
        document.getElementById('loadMore').style = '';
    }
}

async function getColorJSON(i) {
    let url = `https://pokeapi.co/api/v2/pokemon-species/${i}`;
    let urlResponse = await fetch(url);
    let urlResponseToJson = await urlResponse.json();
    return urlResponseToJson;
}

async function getName(i) {
    let colorJson = await getColorJSON(i);
    let name = colorJson['varieties'][0]['pokemon']['name'];
    return name;
}

async function getColor(i) {
    let colorJson = await getColorJSON(i);
    let color = colorJson['color']['name'];
    return color;
}

async function getDetails(i) {
    let url = `https://pokeapi.co/api/v2/pokemon/${loadedPokemons[i]}`;
    let urlResponse = await fetch(url);
    let urlResponseToJson = await urlResponse.json();
    return urlResponseToJson;
}

async function getImage(i) {
    let detailsJson = await getDetails(i);
    let image = detailsJson['sprites']['other']['home']['front_default'];
    return image;
}

async function executeLoading(startPoke, stopPoke) {
    for (let a = startPoke; a < stopPoke; a++) {
        let name = await getName(a);
        let color = await getColor(a);

        loadedPokemons.push(name);

        let detailsJson = await getDetails(a);
        let picture = detailsJson['sprites']['other']['home']['front_default'];

        displayLoadedPokemon(a, color, name, picture);

        loadAbilities(detailsJson, 'abilities', a);
    }
}

async function loadAbilities(detailsJson, idLocation, index) {
    document.getElementById('abilitiesCard').innerHTML = '';
    for (let b = 0; b < 2; b++) {
        if (idLocation == 'abilitiesCard' && detailsJson['abilities'][b]) {
            document.getElementById('abilitiesCard').innerHTML += `
                <span class="abilities">${detailsJson['abilities'][b]['ability']['name']}</span> `;
        } else {
            if (detailsJson['abilities'][b]) {
                document.getElementById(`abilities${index}`).innerHTML += `
                    <span>${detailsJson['abilities'][b]['ability']['name']}</span> `;
            }
        }
    }
}

function loadCardContent() {
    if (baseStats == true) {
        openBaseStats();
    }
    else if (about == true) {
        openAbout();
    }
    else {
        openBaseStats();
    }
}

/*----------------------------------------------------------------------------------------------------------------------------------*/

function displayLoadedPokemon(i, bgColor, name, image) {
    document.getElementById('pokemons').innerHTML += `
        <div class="poke" onclick="openPokemon(${i})" style="border-color: ${bgColor};">
            <div class="description">
                <span id="line1">${name}</span>
                <span id="abilities${i}" class="line2"></span>
            </div>
            <div class="icon">
                <img src="${image}" class="iconImage">
                <img src="assets/close.png" class="iconPokeball">
            </div>
        </div>`;
}

/*----------------------------------------------------------------------------------------------------------------------------------*/

function openCard(checkMaxLoaded, cardID) {
    if (loadedPokemons.length == checkMaxLoaded || loadedPokemons.length >= checkMaxLoaded) {
        openPokemon(cardID);
    }
}

async function loadPokemons() {
    loadedPokemons.push('0');
    if (searchedCard) {
        if (openedSearchedCard == searchedCard) {
            await search();
            openCard(searchedCard, searchedCard);
        } else {
            search();
        }
    } else if (openedCard) {
        await executeLoading(1, loadMoreQuantitiy);
        openCard(loadMoreQuantitiy, openedCard);
    } else {
        executeLoading(1, loadMoreQuantitiy);
    }
}

async function loadMore() {
    let increaseStopInAPI = increaseStartInAPI + 10;
    executeLoading(increaseStartInAPI, increaseStopInAPI);

    increaseStartInAPI = increaseStopInAPI;
    setItem();
}

/*----------------------------------------------------------------------------------------------------------------------------------*/

async function openPokemon(i) {
    document.getElementById('body').classList.add('display-block');
    document.getElementById('cardArea').classList.remove('display-none');

    loadCardHead(i);
    openedCard = i;
    loadCardContent();

    if (searchedCard == i) {
        document.getElementById('previous').style = 'display:none;';
        document.getElementById('next').style = 'display:none;';
        openedSearchedCard = i;
    }

    setItem();
}

async function loadCardHead(i) {
    let background_color = await getColor(i);
    let name = await getName(i)
    let image = await getImage(i)

    document.getElementById('cardHeader').style = `background-color:${background_color};`;
    document.getElementById('name').innerHTML = `${name}`;
    document.getElementById('imageOfPokemon').src = `${image}`;
}

/*----------------------------------------------------------------------------------------------------------------------------------*/

async function openAbout() {
    let detailsJson = await getDetails(openedCard);

    document.getElementById('about').style = '';
    document.getElementById('base_stats').style = 'display: none';

    document.getElementById('height').innerHTML = `${detailsJson['height']} cm`;
    document.getElementById('weight').innerHTML = `${detailsJson['weight']} kg`;
    loadAbilities(detailsJson, 'abilitiesCard', openedCard);
    openMoves();

    about = true;
    baseStats = null;
    localStorage.removeItem('baseStatsToStorage');
    setItem();
}

async function openMoves() {
    let detailsJson = await getDetails(openedCard);
    document.getElementById('moves').innerHTML = '';
    for (let i = 0; i < 10; i++) {
        let move = detailsJson['moves'][i]['move']['name'];
        document.getElementById('moves').innerHTML += `<span>${move}</span>`;
    }
}

async function openBaseStats() {
    document.getElementById('about').style = 'display: none';
    document.getElementById('base_stats').style = '';

    loadBaseStats();

    baseStats = true;
    about = null;
    localStorage.removeItem('aboutToStorage');
    setItem();
}

async function loadBaseStats() {
    let detailsJson = await getDetails(openedCard);

    document.getElementById('base_stats').innerHTML = '';
    for (let u = 0; u < detailsJson['stats'].length; u++) {
        let stat = detailsJson['stats'][u]['stat']['name'];
        document.getElementById('base_stats').innerHTML += `
        <div class="statContainer">
            <span>${stat}</span>
            <div class="percentbar">
                <div id=${stat} class="animation"></div>
            </div>
        </div>`;

        document.getElementById(stat).style = `width: ${detailsJson['stats'][u]['base_stat']}%;`;
        document.getElementById(stat).innerHTML = `${detailsJson['stats'][u]['base_stat']}%`;
    }
}

function closeCard() {
    document.getElementById('about').style = 'display: none';
    document.getElementById('base_stats').style = 'display: none';
    document.getElementById('cardArea').classList.add('display-none');
    document.getElementById('body').classList.remove('display-block');

    clearArraysAndStorages();

    if (searchedCard) {
    } else {
        searchedCard = null;
        localStorage.removeItem('searchedCardStorage');
    }
}

function clearArraysAndStorages() {
    about = null;
    baseStats = null;
    openedCard = null;
    openedSearchedCard = null;
    localStorage.removeItem('aboutToStorage');
    localStorage.removeItem('baseStatsToStorage');
    localStorage.removeItem('openedCardStorage');
    localStorage.removeItem('openedSearchedCardStorage');
}

function goPrevious() {
    let previousPoke = openedCard - 1;
    if (previousPoke == 0) {
    } else {
        about = null;
        baseStats = null;
        openPokemon(previousPoke);
    }
}

function goNext() {
    let nextPoke = openedCard + 1;
    if (nextPoke >= increaseStartInAPI) {
    } else {
        about = null;
        baseStats = null;
        openPokemon(nextPoke);
    }
}

function urlExists(url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    if (http.status != 404) {
        document.getElementById('alert').style = 'display:none;'
    } else {
        document.getElementById('alert').style = ''
    }
}

function displayInputFieldContent(inputField) {
    if (searchedCard == null) {
    } else if (searchedCard && searchedCard !== inputField) {
    } else if (searchedCard && inputField == '') {
        inputField = searchedCard;
    } else if (searchedCard && searchedCard == inputField) {
        inputField = searchedCard;
    }
}

async function displaySearchedPokemon(responseAsJson, id) {
    let color = await getColor(id);
    let name = await getName(id);
    let image = await getImage(id);

    document.getElementById('pokemons').innerHTML = '';
    displayLoadedPokemon(id, color, name, image);
    loadAbilities(responseAsJson, `abilities`, id);

    document.getElementById('loadMore').classList.add('display-none');
}

async function search() {
    let inputField = document.getElementById('input').value.toLowerCase();
    displayInputFieldContent(inputField);
    let url = `https://pokeapi.co/api/v2/pokemon/${inputField}`;
    urlExists(url);
    let response = await fetch(url);
    let responseAsJson = await response.json();
    let id = responseAsJson['id'];

    loadedPokemons = [];
    loadedPokemons.push('0');
    for (let T = 1; T < (id + 1); T++) {
        loadedPokemons.push(T);
    }

    await displaySearchedPokemon(responseAsJson, id);

    searchedCard = id;
    setItem();
}

function reset() {
    clearVarsAndLocalStorage();

    loadedPokemons = [];
    loadMoreQuantitiy = 10;
    increaseStartInAPI = loadMoreQuantitiy;
    loadPokemons();

    document.getElementById('previous').style = '';
    document.getElementById('next').style = '';
    document.getElementById('input').value = '';
    document.getElementById('alert').style = 'display:none;'
    document.getElementById('pokemons').innerHTML = '';
    document.getElementById('loadMore').classList.remove('display-none');
}

function clearVarsAndLocalStorage() {
    openedCard = null;
    searchedCard = null;
    openedSearchedCard = null;
    localStorage.removeItem('openedCardStorage');
    localStorage.removeItem('searchedCardStorage');
    localStorage.removeItem('openedSearchedCardStorage');
    localStorage.removeItem('increaseStartInAPIStorage');
}
















window.onscroll = function () { scrollStop() };

function scrollStop() {
    if (window.pageYOffset > 0.1) {
        document.getElementById('headerArea').classList.add('sticky');
    } else {
        document.getElementById('headerArea').classList.remove('sticky');
    }
}
















function setItem() {
    if (increaseStartInAPI > loadMoreQuantitiy) {
        let increaseStartInAPIToString = JSON.stringify(increaseStartInAPI);
        localStorage.setItem('increaseStartInAPIStorage', increaseStartInAPIToString);
    }
    if (openedCard) {
        let openedCardToString = JSON.stringify(openedCard);
        localStorage.setItem('openedCardStorage', openedCardToString);
    }
    setItem_cardContent();
    setItem_searchedCard();
}

function setItem_cardContent() {
    if (about) {
        let aboutToString = JSON.stringify(about);
        localStorage.setItem('aboutToStorage', aboutToString);
    }

    if (baseStats) {
        let baseStatsToString = JSON.stringify(baseStats);
        localStorage.setItem('baseStatsToStorage', baseStatsToString);
    }
}

function setItem_searchedCard() {
    if (searchedCard) {
        let searchedCardToString = JSON.stringify(searchedCard);
        localStorage.setItem('searchedCardStorage', searchedCardToString);
    }

    if (openedSearchedCard) {
        let openedSearchedCardToString = JSON.stringify(openedSearchedCard);
        localStorage.setItem('openedSearchedCardStorage', openedSearchedCardToString);
    }
}


function getItem() {
    let increaseStartInAPIToArray = localStorage.getItem('increaseStartInAPIStorage');
    if (increaseStartInAPIToArray) {
        loadMoreQuantitiy = JSON.parse(increaseStartInAPIToArray);
    }

    let openedCardToArray = localStorage.getItem('openedCardStorage');
    if (openedCardToArray) {
        openedCard = JSON.parse(openedCardToArray);
    }

    getItem_cardContent();
    getItem_searchedCard();
}

function getItem_cardContent() {
    let aboutToArray = localStorage.getItem('aboutToStorage');
    if (aboutToArray) {
        about = JSON.parse(aboutToArray);
    }

    let baseStatsToArray = localStorage.getItem('baseStatsToStorage');
    if (baseStatsToArray) {
        baseStats = JSON.parse(baseStatsToArray);
    }
}

function getItem_searchedCard() {
    let searchedCardToArray = localStorage.getItem('searchedCardStorage');
    if (searchedCardToArray) {
        searchedCard = JSON.parse(searchedCardToArray);
    };

    let openedSearchedCardToArray = localStorage.getItem('openedSearchedCardStorage');
    if (openedSearchedCardToArray) {
        openedSearchedCard = JSON.parse(openedSearchedCardToArray);
    };
}



