"use strict";

import { fetchData } from "./api.js";

const addEventOnElements = function ($elements, eventType, callback) {
  for (const $item of $elements) {
    $item.addEventListener(eventType, callback);
  }
};

/**
 * Header scroll state
 */
const $header = document.querySelector("[data-header]");

window.addEventListener("scroll", function () {
  $header.classList[this.window.scrollY > 50 ? "add" : "remove"]("active");
});

/**
 * Search Toggle
 */

const $searchToggler = document.querySelector("[data-search-toggler]");

const $searchField = document.querySelector("[data-search-field]");

let isExpanded = false;

$searchToggler.addEventListener("click", function () {
  $header.classList.toggle("search-active");

  isExpanded = isExpanded ? false : true;

  this.setAttribute("aria-expanded", isExpanded);

  $searchField.focus();
});


/**
 * Tab Navigation
 */

const /** {NodeList} */ $tabBtns = document.querySelectorAll("[data-tab-btn]");
const /** {NodeList} */ $tabPanels = document.querySelectorAll("[data-tab-panel]");

let /** {NodeElement} */ [$lastActiveTabBtn] = $tabBtns;
let /** {NodeElement} */ [$lastActiveTabPanel] = $tabPanels;

addEventOnElements($tabBtns, "click", function () {
  $lastActiveTabBtn.setAttribute("aria-selected", "false");
  $lastActiveTabPanel.setAttribute("hidden", "");

  this.setAttribute("aria-selected", "true")
  const $currentTabPanel = document.querySelector(`#${this.getAttribute("aria-controls")}`);
  $currentTabPanel.hidden = false;

  $lastActiveTabBtn = this;
  $lastActiveTabPanel = $currentTabPanel;
});


/**
 * Keyboard accessibility for buttons
 */


/**
 * API Integration
 */

/**
 * Search
 */

const /** {NodeElement} */ $searchSubmit = document.querySelector("[data-search-submit]");

let /** {String} */ apiUrl = "https://api.github.com/users/dipayandas24";
let /** {String} */ repoUrl, followingUrl ="";

const searchUser = function () {
  if (!$searchField.value) return;

  apiUrl = `https://api.github.com/users/${$searchField.value}`;
  updateProfile(apiUrl);
}

// Enter Key Funtionality

$searchField.addEventListener("keydown", e => {
  if (e.key === "Enter") searchUser();
});

/**
 * Profile API
 */

const /** {NodeElement} */ $profileCard = document.querySelector(
  "[data-profile-card]");
const /** {NodeElement} */ $repoPanel = document.querySelector(
  "[data-repo-panel]");
const /** {NodeElement} */ $error = document.querySelector("[data-error]");

window.updateProfile = function (profileUrl) {

   $error.style.display = "none";
   document.body.style.overflowY = "visible";

    $profileCard.innerHTML = `
      <div class="profile-skeleton">
        <div class="skeleton avatar-skeleton"></div>
        <div class="skeleton title-skeleton"></div>
        <div class="skeleton text-skeleton text-1"></div>
        <div class="skeleton text-skeleton text-2"></div>
        <div class="skeleton text-skeleton text-3"></div>
      </div>`;

  $tabBtns[0].click();

  

  fetchData(profileUrl, data => {
    const {
      type,
      avatar_url,
      name,
      login: username,
      html_url: githubPage,
      bio,
      location,
      company,
      public_repos,
      followers,
      following,
      following_url,
      repos_url
    } = data;
  
    repoUrl = repos_url;
    followingUrl = following_url.replace("{/other_user}", "");
  
    $profileCard.innerHTML = `
      <figure class="${type === "User" ? "avatar-circle" : "avatar-rounded"} img-holder" style="--width: 200; --height: 200">
        <img src="${avatar_url}" alt="${username}" width="200" height="200" />
      </figure>
  
      ${name ? `<h1 class="title-2">${name}</h1>` : ""}
  
      <p class="username text-primary">${username}</p>
  
      ${bio ? `<p class="bio">${bio}</p>` : ""}
  
      <a href="${githubPage}" target="_blank" class="btn btn-secondary">
        <span class="material-symbols-rounded" aria-hidden="true">open_in_new</span>
        <span class="span">Open Profile on GitHub</span>
      </a>
  
      <ul class="profile-meta">
        ${location ? `
          <li class="meta-item">
            <span class="material-symbols-rounded" aria-hidden="true">location_on</span>
            <span class="meta-text">${location}</span>
          </li>` : ""}
        
        ${company ? `
          <li class="meta-item">
            <span class="material-symbols-rounded" aria-hidden="true">business</span>
            <span class="meta-text">${company}</span>
          </li>` : ""}
      </ul>
  
      <ul class="profile-stats">
        <li class="stats-item"><span class="body">${public_repos}</span> Repos</li>
        <li class="stats-item"><span class="body">${followers}</span> Followers</li>
        <li class="stats-item"><span class="body">${following}</span> Following</li>
      </ul>
    `;
  
    updateRepositories();
  
  }, () => {
    $error.style.display = "grid";
  document.body.style.overflowY = "hidden"; 
  
  $error.innerHTML = `
    <p class="title-1">Oops! :(</p>
    <p class="text">There is no such GitHub Account</p>
  `;
  });
  






}

  
updateProfile(apiUrl);

/**
 * Repo API
 */

let forkedRepos = [];

const updateRepositories = function() {
  fetchData(`${repoUrl}?sort=created&per_page=12`, function(data) {
    $repoPanel.innerHTML = `<h2 class="sr-only">Repositories</h2>`;
    forkedRepos = data.filter(item => item.fork);

    const repositories = data.filter(i => !i.fork);

    if (repositories.length) {
      for (const repo of repositories) {
        const {
          name,
          html_url,
          description,
          private: isPrivate,
          language,
          stargazers_count: stars_count,
          forks_count,
        } = repo;

        const $repoCard = document.createElement("article");
        $repoCard.classList.add("card", "repo-card");

        $repoCard.innerHTML = `
          <div class="card-body">
            <a href="${html_url}" target="_blank" class="card-title">
              <h3 class="title-3">${name}</h3>
            </a>
            ${description ? `<p class="card-text">${description}</p>` : ""}
            <span class="badge">${isPrivate ? "Private" : "Public"}</span>
          </div>

          <div class="card-footer">
            ${language
                ? `<div class="meta-item">
                    <span class="material-symbols-rounded" aria-hidden="true">code_blocks</span>
                    <span class="span">${language}</span>
                  </div>`
                : ""
            }
            
        `;

        $repoPanel.appendChild($repoCard);
      }
    } else {
      $repoPanel.innerHTML = `
        <div class="error-content">
          <p class="title-1">Oops! :( </p>
          <p class="text">Doesn't have any public repositories yet.</p>
        </div>
      `;
    }
  });
};

updateRepositories();

 