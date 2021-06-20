// Key and api paths stored in the const for future use
const KEY = "3fd2be6f0c70a2a598f084ddfb75487c";
const API_URL = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${KEY}&page=`;
const IMG_PATH = "https://image.tmdb.org/t/p/w500";
const SEARCH_API = `https://api.themoviedb.org/3/search/movie?api_key=${KEY}&query=`;

// getting the access of the DOM elemnets by get element by id
const main = document.getElementById("main");
const details = document.getElementById("myModal");
const search = document.getElementById("search");
const crossIcon = document.getElementById("cross-icon");
crossIcon.style.visibility = "hidden";

// variable declaration
let searchEnable = false;
let currentPage = 1;
let searchTerm = "";
let maxPage;
let listData = [];
let sortedBy = "";
let timerId;

// function to get the list of movies from the server
const getMovies = async (url) => {
  const res = await fetch(url);
  const response = await res.json();
  listData = listData.concat(response.results);
  maxPage = response.total_pages;
  showMovies(listData);
};
getMovies(API_URL + currentPage);

// function to show the movies on the screen which were fetched from the server
const showMovies = (movies) => {
  // checking if search enable is true than we need to clear the main element
  searchEnable ? (main.innerHTML = '') : '';

  // checking if any sorting is applied on the movies if so then dispaly a sorted by div on the screen
  if (sortedBy !== "") {
    const sortElement = document.createElement("div");
    sortElement.classList.add("sortBy");
    sortElement.innerHTML = `
         SORTED BY : ${sortedBy}
      `;
    main.appendChild(sortElement);
  }
  movies.forEach((movie) => {
    // showing each movie tile on the screen
    const { title, poster_path, vote_average, overview, backdrop_path } = movie;
    const movieElement = document.createElement("div");
    movieElement.classList.add("movie");
    if (poster_path) {
      movieElement.innerHTML = `
            <img
                src="${IMG_PATH + poster_path}"
                alt="${title}"
                srcset="${IMG_PATH + poster_path}"
                            />
            <div class="movie-info">
                <h3>${title}</h3>
                <span class="${getClassByRate(
                  vote_average
                )}">${vote_average}</span>
            </div>
        `;
      main.appendChild(movieElement);
    }

    // adding click event listener on each element to show the details page
    movieElement.addEventListener("click", () => {
      main.classList.add("blur");
      const movieDetails = document.createElement("div");
      movieDetails.classList.add("modal");
      movieDetails.style.backgroundImage = `url(${IMG_PATH + backdrop_path})`;
      movieDetails.innerHTML = `
                <div class="modal-content">
                    <span id="model-close"class="close">&times;</span>
                    <h2>${title}</h2>
                    <span class="flex">
                        <span><h3>Overview</h3><span>
                        ${overview}
                    </span>   
                </div>
        `;
      details.appendChild(movieDetails);
    });
  });
};

// function to change the color of rating text according to the vales
const getClassByRate = (vote) => {
  if (vote >= 7.5) return "green";
  else if (vote >= 7) return "orange";
  else return "red";
};

// function to open the dropdown
const openSortByDropdown = () => {
  document.getElementById("myDropdown").classList.toggle("show");
};

// sort function to be trigerred by the the dropo down with the property as parameter
const sort = (property, name) => {
  sortedBy = name;
  sortByKey(listData, property);
  main.innerHTML = "";
  document.documentElement.scrollTop = 0;
  showMovies(listData);
};

// sort by key function which will take array and the key by which it will sort the array and return
const sortByKey = (array, key) => {
  return array.sort(function (a, b) {
    var x = a[key];
    var y = b[key];
    return x < y ? -1 : x > y ? 1 : 0;
  });
};

// to clear the user text entered inside the search box
const ClearSearch = () => {
  search.value = "";
  getMovies(API_URL + currentPage);
};

// throttleFunction to make an api call after certain period of time passed inside the function only
const throttleFunction = (func, param, delay) => {
  // If setTimeout is already scheduled, no need to do anything
  if (timerId) {
    return;
  }
  // Schedule a setTimeout after delay seconds
  timerId = setTimeout(function () {
    func(param);
    // Once setTimeout function execution is finished, timerId = undefined so that in <br>
    // the next scroll event function execution can be scheduled by the setTimeout
    timerId = undefined;
  }, delay);
};

// adding one event listener on window scroll to achieve lazy loading of movies when user reaches at the end of Page
window.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 5 && searchEnable) {
    currentPage++;
    if (currentPage < maxPage) {
      getMovies(SEARCH_API + searchTerm);
    }
  }
  if (
    scrollTop + clientHeight >= scrollHeight - 5 &&
    !searchEnable &&
    currentPage < maxPage
  ) {
    currentPage++;
    if (currentPage < maxPage) {
      getMovies(API_URL + currentPage);
    }
  }
});

// adding eventlistner on detail div so that when user clicks on any where on the screen it will close the details page
details.addEventListener(
  "click",
  () => {
    details.innerHTML = "";
    main.classList.remove("blur");
  },
  {
    passive: true,
  }
);

// adding key up eventlistener while user typing in the serach bar
search.addEventListener("keyup", (e) => {
  e.preventDefault();
  searchTerm = search.value;
  sortedBy = "";
  crossIcon.style.visibility = "visible";
  if (searchTerm && searchTerm !== "") {
    listData = [];
    searchEnable = true;
    // using throtlling in making the api calls while searching to reduce the nmber of api searches
    throttleFunction(getMovies, SEARCH_API + searchTerm, 800);
  } else history.go(0);
});

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
  event.preventDefault();
  if (!event.target.matches(".dropbtn")) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};

function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.documentElement.className = themeName;
}

// function to toggle between light and dark theme
function toggleTheme() {
    if (localStorage.getItem('theme') === 'theme-dark') {
        setTheme('theme-light');
    } else {
        setTheme('theme-dark');
    }
}

// Immediately invoked function to set the theme on initial load
(function () {
    if (localStorage.getItem('theme') === 'theme-dark') {
        setTheme('theme-dark');
    } else {
        setTheme('theme-light');
    }
})();
