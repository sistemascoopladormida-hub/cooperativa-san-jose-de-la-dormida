"use client"

import { useEffect, useRef } from "react"
import Script from "next/script"

declare global {
  interface Window {
    google: any
    initMap: () => void
    NeighborhoodDiscovery: any
    Handlebars: any
  }
  const Handlebars: any
}

interface GoogleMapsNeighborhoodProps {
  apiKey: string
  center: { lat: number; lng: number }
  mapRadius?: number
  pois?: Array<{ placeId: string }>
  centerMarker?: { icon: string }
}

// Define initMap globally before the component renders
// This must be done at module level, not inside useEffect
if (typeof window !== "undefined" && !window.initMap) {
  window.initMap = function() {
    // This will be called by Google Maps API when it loads
    // The actual initialization happens in the component's onLoad callback
    console.log("Google Maps API callback called")
  }
}

export default function GoogleMapsNeighborhood({
  apiKey,
  center,
  mapRadius = 2000,
  pois = [],
  centerMarker = { icon: "circle" },
}: GoogleMapsNeighborhoodProps) {
  const widgetRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)
  const configRef = useRef({ apiKey, center, mapRadius, pois, centerMarker })

  // Update config ref when props change
  useEffect(() => {
    configRef.current = { apiKey, center, mapRadius, pois, centerMarker }
  }, [apiKey, center, mapRadius, pois, centerMarker])

  useEffect(() => {
    if (!window.google || initializedRef.current) return

    const initWidget = () => {
      if (!widgetRef.current || initializedRef.current) return
      initializedRef.current = true

      const config = configRef.current
      const CONFIGURATION = {
        capabilities: {
          search: true,
          distances: true,
          directions: true,
          contacts: true,
          atmospheres: true,
          thumbnails: true,
        },
        pois: config.pois,
        centerMarker: config.centerMarker,
        mapRadius: config.mapRadius,
        mapOptions: {
          center: config.center,
          fullscreenControl: true,
          mapTypeControl: true,
          streetViewControl: false,
          zoom: 16,
          zoomControl: true,
          maxZoom: 20,
          mapId: "",
        },
        mapsApiKey: config.apiKey,
      }

      if (window.NeighborhoodDiscovery) {
        new window.NeighborhoodDiscovery(CONFIGURATION)
      }
    }

    // Load Handlebars first, then initialize
    // @ts-ignore - Handlebars is loaded dynamically
    if (typeof window.Handlebars === "undefined") {
      const handlebarsScript = document.createElement("script")
      handlebarsScript.src = "https://ajax.googleapis.com/ajax/libs/handlebars/4.7.7/handlebars.min.js"
      handlebarsScript.onload = initWidget
      document.head.appendChild(handlebarsScript)
    } else {
      initWidget()
    }
  }, [])

  return (
    <>
      <Script
        id="google-maps-neighborhood-script"
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=places,geometry&solution_channel=GMP_QB_neighborhooddiscovery_v3_cABCDEF`}
        strategy="lazyOnload"
        onLoad={() => {
          // Load Handlebars first if not already loaded
          if (typeof window.Handlebars === "undefined") {
            const handlebarsScript = document.createElement("script")
            handlebarsScript.src = "https://ajax.googleapis.com/ajax/libs/handlebars/4.7.7/handlebars.min.js"
            handlebarsScript.onload = () => {
              // Load the Neighborhood Discovery widget code after Handlebars
              const widgetScript = document.createElement("script")
              widgetScript.innerHTML = getNeighborhoodDiscoveryCode()
              document.body.appendChild(widgetScript)
              
              // Initialize the widget after both scripts are loaded
              setTimeout(() => {
                if (widgetRef.current && window.google && window.NeighborhoodDiscovery && !initializedRef.current) {
                  initializedRef.current = true
                  const CONFIGURATION = {
                    capabilities: {
                      search: true,
                      distances: true,
                      directions: true,
                      contacts: true,
                      atmospheres: true,
                      thumbnails: true,
                    },
                    pois: pois,
                    centerMarker: centerMarker,
                    mapRadius: mapRadius,
                    mapOptions: {
                      center: center,
                      fullscreenControl: true,
                      mapTypeControl: true,
                      streetViewControl: false,
                      zoom: 16,
                      zoomControl: true,
                      maxZoom: 20,
                      mapId: "",
                    },
                    mapsApiKey: apiKey,
                  }
                  new window.NeighborhoodDiscovery(CONFIGURATION)
                }
              }, 200)
            }
            document.head.appendChild(handlebarsScript)
          } else {
            // Handlebars already loaded, just load the widget code
            const widgetScript = document.createElement("script")
            widgetScript.innerHTML = getNeighborhoodDiscoveryCode()
            document.body.appendChild(widgetScript)
            
            // Initialize the widget
            setTimeout(() => {
              if (widgetRef.current && window.google && window.NeighborhoodDiscovery && !initializedRef.current) {
                initializedRef.current = true
                const CONFIGURATION = {
                  capabilities: {
                    search: true,
                    distances: true,
                    directions: true,
                    contacts: true,
                    atmospheres: true,
                    thumbnails: true,
                  },
                  pois: pois,
                  centerMarker: centerMarker,
                  mapRadius: mapRadius,
                  mapOptions: {
                    center: center,
                    fullscreenControl: true,
                    mapTypeControl: true,
                    streetViewControl: false,
                    zoom: 16,
                    zoomControl: true,
                    maxZoom: 20,
                    mapId: "",
                  },
                  mapsApiKey: apiKey,
                }
                new window.NeighborhoodDiscovery(CONFIGURATION)
              }
            }, 200)
          }
        }}
      />
      <div ref={widgetRef} className="neighborhood-discovery">
        <div className="places-panel panel no-scroll">
          <header className="navbar">
            <div className="search-input">
              <input className="place-search-input" placeholder="Buscar lugares cercanos" />
              <button className="place-search-button">
                <img
                  src="https://fonts.gstatic.com/s/i/googlematerialicons/search/v11/24px.svg"
                  alt="search"
                />
              </button>
            </div>
          </header>
          <div className="results">
            <ul className="place-results-list"></ul>
          </div>
          <button className="show-more-button sticky">
            <span>Ver más</span>
            <img
              className="right"
              src="https://fonts.gstatic.com/s/i/googlematerialicons/expand_more/v11/24px.svg"
              alt="expand"
            />
          </button>
        </div>
        <div className="details-panel panel"></div>
        <div className="map"></div>
        <div className="photo-modal">
          <img alt="place photo" />
          <div>
            <button className="back-button">
              <img
                className="icon"
                src="https://fonts.gstatic.com/s/i/googlematerialicons/arrow_back/v11/24px.svg"
                alt="back"
              />
            </button>
            <div className="photo-text">
              <div className="photo-place"></div>
              <div className="photo-attrs">
                Foto por <span></span>
              </div>
            </div>
          </div>
        </div>
        <svg className="marker-pin" xmlns="http://www.w3.org/2000/svg" width="26" height="38" fill="none">
          <path d="M13 0C5.817 0 0 5.93 0 13.267c0 7.862 5.59 10.81 9.555 17.624C12.09 35.248 11.342 38 13 38c1.723 0 .975-2.817 3.445-7.043C20.085 24.503 26 21.162 26 13.267 26 5.93 20.183 0 13 0Z" />
        </svg>
      </div>
      <style jsx global>{`
        html,
        body {
          height: 100%;
          margin: 0;
          padding: 0;
        }

        .neighborhood-discovery {
          box-sizing: border-box;
          font-family: "Roboto", sans-serif;
          height: 100%;
          position: relative;
          width: 100%;
        }

        .neighborhood-discovery a {
          color: #4285f4;
          text-decoration: none;
        }

        .neighborhood-discovery button {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font: inherit;
          font-size: inherit;
          padding: 0;
        }

        .neighborhood-discovery .info {
          color: #555;
          font-size: 0.9em;
          margin-top: 0.3em;
        }

        .neighborhood-discovery .panel {
          background: white;
          bottom: 0;
          box-sizing: border-box;
          left: 0;
          overflow-y: auto;
          position: absolute;
          top: 0;
          width: 20em;
        }

        .neighborhood-discovery .panel.no-scroll {
          overflow-y: hidden;
        }

        .neighborhood-discovery .photo {
          background-color: #dadce0;
          background-position: center;
          background-size: cover;
          border-radius: 0.3em;
          cursor: pointer;
        }

        .neighborhood-discovery .navbar {
          background: white;
          position: sticky;
          top: 0;
          z-index: 2;
        }

        .neighborhood-discovery .right {
          float: right;
        }

        .neighborhood-discovery .star-icon {
          filter: invert(88%) sepia(60%) saturate(2073%) hue-rotate(318deg) brightness(93%) contrast(104%);
          height: 1.2em;
          margin-right: -0.3em;
          margin-top: -0.08em;
          vertical-align: top;
          width: 1.2em;
        }

        .neighborhood-discovery .star-icon:last-child {
          margin-right: 0.2em;
        }

        .neighborhood-discovery .travel-icon {
          height: 1.2em;
          margin-top: -0.08em;
          vertical-align: top;
        }

        .neighborhood-discovery .map {
          bottom: 0;
          left: 20em;
          position: absolute;
          right: 0;
          top: 0;
        }

        @media only screen and (max-width: 640px) {
          .neighborhood-discovery .panel {
            right: 0;
            top: 50%;
            width: unset;
          }

          .neighborhood-discovery .map {
            bottom: 50%;
            left: 0;
          }
        }

        /* --------------------------- PLACES PANEL --------------------------- */

        .neighborhood-discovery .places-panel {
          box-shadow: 0 0 10px rgb(60 64 67 / 28%);
          z-index: 1;
        }

        .neighborhood-discovery .places-panel header {
          padding: 0.5em;
        }

        .neighborhood-discovery .search-input {
          position: relative;
        }

        .neighborhood-discovery .search-input input {
          border: 1px solid rgba(0, 0, 0, 0.2);
          border-radius: 0.3em;
          box-sizing: border-box;
          font-size: 1em;
          height: 2.2em;
          padding: 0 2.5em 0 1em;
          width: 100%;
        }

        .neighborhood-discovery .search-input button {
          position: absolute;
          right: 0.8em;
          top: 0.8em;
        }

        .neighborhood-discovery .show-more-button {
          bottom: 0.5em;
          display: none;
          left: 28%;
          line-height: 1.5em;
          padding: 0.6em;
          position: relative;
          width: 44%;
        }

        .neighborhood-discovery .show-more-button.sticky {
          background: white;
          border-radius: 1.5em;
          box-shadow: 0 4px 10px rgb(60 64 67 / 28%);
          position: sticky;
          z-index: 2;
        }

        .neighborhood-discovery .show-more-button:disabled {
          opacity: 0.5;
        }

        .neighborhood-discovery .place-results-list {
          list-style-type: none;
          margin: 0;
          padding: 0;
        }

        .neighborhood-discovery .place-result {
          border-top: 1px solid rgba(0, 0, 0, 0.12);
          cursor: pointer;
          display: flex;
          padding: 0.8em;
        }

        .neighborhood-discovery .place-result .text {
          flex-grow: 1;
        }

        .neighborhood-discovery .place-result .name {
          font-size: 1em;
          font-weight: 500;
          text-align: left;
        }

        .neighborhood-discovery .place-result .photo {
          flex: 0 0 4em;
          height: 4em;
          margin-left: 0.8em;
        }

        /* -------------------------- DETAILS PANEL --------------------------- */

        .neighborhood-discovery .details-panel {
          display: none;
          z-index: 20;
        }

        .neighborhood-discovery .details-panel .back-button {
          color: #4285f4;
          padding: 0.9em;
        }

        .neighborhood-discovery .details-panel .back-button .icon {
          filter: invert(47%) sepia(71%) saturate(2372%) hue-rotate(200deg) brightness(97%) contrast(98%);
          height: 1.2em;
          width: 1.2em;
          vertical-align: bottom;
        }

        .neighborhood-discovery .details-panel header {
          padding: 0.9em;
        }

        .neighborhood-discovery .details-panel h2 {
          font-size: 1.4em;
          font-weight: 400;
          margin: 0;
        }

        .neighborhood-discovery .details-panel .section {
          border-top: 1px solid rgba(0, 0, 0, 0.12);
          padding: 0.9em;
        }

        .neighborhood-discovery .details-panel .contact {
          align-items: center;
          display: flex;
          font-size: 0.9em;
          margin: 0.8em 0;
        }

        .neighborhood-discovery .details-panel .contact .icon {
          width: 1.5em;
          height: 1.5em;
        }

        .neighborhood-discovery .details-panel .contact .text {
          margin-left: 1em;
        }

        .neighborhood-discovery .details-panel .contact .weekday {
          display: inline-block;
          width: 5em;
        }

        .neighborhood-discovery .details-panel .photos {
          text-align: center;
        }

        .neighborhood-discovery .details-panel .photo {
          display: inline-block;
          height: 5.5em;
          width: 5.5em;
        }

        .neighborhood-discovery .details-panel .review {
          margin-top: 1.2em;
        }

        .neighborhood-discovery .details-panel .review .reviewer-avatar {
          background-repeat: no-repeat;
          background-size: cover;
          float: left;
          height: 1.8em;
          margin-right: 0.8em;
          width: 1.8em;
        }

        .neighborhood-discovery .details-panel .review .reviewer-name {
          color: #202124;
          font-weight: 500;
          line-height: 1.8em;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .neighborhood-discovery .details-panel .review .rating {
          margin: 0.5em 0;
        }

        .neighborhood-discovery .details-panel .attribution {
          color: #777;
          margin: 0;
          font-size: 0.8em;
          font-style: italic;
        }

        /* --------------------------- PHOTO MODAL ---------------------------- */

        .neighborhood-discovery .photo-modal {
          background: rgba(0, 0, 0, 0.8);
          display: none;
          height: 100%;
          position: fixed;
          width: 100%;
          z-index: 100;
        }

        .neighborhood-discovery .photo-modal > img {
          bottom: 0;
          left: 0;
          margin: auto;
          max-height: 100%;
          max-width: 100%;
          position: absolute;
          right: 0;
          top: 0;
        }

        .neighborhood-discovery .photo-modal > div {
          border-radius: 0.4em;
          color: white;
          background: rgba(0, 0, 0, 0.6);
          margin: 1em;
          padding: 0.9em;
          position: absolute;
        }

        .neighborhood-discovery .photo-modal .back-button .icon {
          filter: brightness(0) invert(1);
          margin: 0.4em 0.6em 0 0;
        }

        .neighborhood-discovery .photo-modal .photo-text {
          float: right;
        }

        .neighborhood-discovery .photo-modal .photo-attrs {
          font-size: 0.8em;
          margin-top: 0.3em;
        }
      `}</style>
      <script
        id="nd-place-results-tmpl"
        type="text/x-handlebars-template"
        dangerouslySetInnerHTML={{
          __html: getPlaceResultsTemplate(),
        }}
      />
      <script
        id="nd-place-details-tmpl"
        type="text/x-handlebars-template"
        dangerouslySetInnerHTML={{
          __html: getPlaceDetailsTemplate(),
        }}
      />
    </>
  )
}

function getPlaceResultsTemplate(): string {
  const dollarSign = "$"
  return `{{#each places}}
        <li class="place-result">
          <div class="text">
            <button class="name">{{name}}</button>
            <div class="info">
              {{#if rating}}
                <span>{{rating}}</span>
                <img src="https://fonts.gstatic.com/s/i/googlematerialicons/star/v15/24px.svg" alt="rating" class="star-icon"/>
              {{/if}}
              {{#if numReviews}}
                <span>&nbsp;({{numReviews}})</span>
              {{/if}}
              {{#if priceLevel}}
                &#183;&nbsp;<span>{{#each dollarSigns}}` + dollarSign + `{{/each}}&nbsp;</span>
              {{/if}}
            </div>
            <div class="info">{{type}}</div>
          </div>
          <button class="photo" style="background-image:url({{photos.0.urlSmall}})" aria-label="show photo in viewer"></button>
        </li>
      {{/each}}`
}

function getPlaceDetailsTemplate(): string {
  const dollarSign = "$"
  return `<div class="navbar">
        <button class="back-button">
          <img class="icon" src="https://fonts.gstatic.com/s/i/googlematerialicons/arrow_back/v11/24px.svg" alt="back"/>
          Volver
        </button>
      </div>
      <header>
        <h2>{{name}}</h2>
        <div class="info">
          {{#if rating}}
            <span class="star-rating-numeric">{{rating}}</span>
            <span>
              {{#each fullStarIcons}}
                <img src="https://fonts.gstatic.com/s/i/googlematerialicons/star/v15/24px.svg" alt="full star" class="star-icon"/>
              {{/each}}
              {{#each halfStarIcons}}
                <img src="https://fonts.gstatic.com/s/i/googlematerialicons/star_half/v17/24px.svg" alt="half star" class="star-icon"/>
              {{/each}}
              {{#each emptyStarIcons}}
                <img src="https://fonts.gstatic.com/s/i/googlematerialicons/star_outline/v9/24px.svg" alt="empty star" class="star-icon"/>
              {{/each}}
            </span>
          {{/if}}
          {{#if numReviews}}
            <a href="{{url}}" target="_blank">{{numReviews}} reseñas</a>
          {{else}}
            <a href="{{url}}" target="_blank">Ver en Google Maps</a>
          {{/if}}
          {{#if priceLevel}}
            &#183;
            <span class="price-dollars">
              {{#each dollarSigns}}` + dollarSign + `{{/each}}
            </span>
          {{/if}}
        </div>
        {{#if type}}
          <div class="info">{{type}}</div>
        {{/if}}
        {{#if duration}}
          <div class="info">
            <img src="https://fonts.gstatic.com/s/i/googlematerialicons/directions_car/v11/24px.svg" alt="car travel" class="travel-icon"/>
            <span>&nbsp;{{duration.text}}</span>
          </div>
        {{/if}}
      </header>
      <div class="section">
        {{#if address}}
          <div class="contact">
            <img src="https://fonts.gstatic.com/s/i/googlematerialicons/place/v10/24px.svg" alt="Address" class="icon"/>
            <div class="text">
              {{address}}
            </div>
          </div>
        {{/if}}
        {{#if website}}
          <div class="contact">
            <img src="https://fonts.gstatic.com/s/i/googlematerialicons/public/v10/24px.svg" alt="Website" class="icon"/>
            <div class="text">
              <a href="{{website}}" target="_blank">{{websiteDomain}}</a>
            </div>
          </div>
        {{/if}}
        {{#if phoneNumber}}
          <div class="contact">
            <img src="https://fonts.gstatic.com/s/i/googlematerialicons/phone/v10/24px.svg" alt="Phone number" class="icon"/>
            <div class="text">
              {{phoneNumber}}
            </div>
          </div>
        {{/if}}
        {{#if openingHours}}
          <div class="contact">
            <img src="https://fonts.gstatic.com/s/i/googlematerialicons/schedule/v12/24px.svg" alt="Opening hours" class="icon"/>
            <div class="text">
              {{#each openingHours}}
                <div>
                  <span class="weekday">{{days}}</span>
                  <span class="hours">{{hours}}</span>
                </div>
              {{/each}}
            </div>
          </div>
        {{/if}}
      </div>
      {{#if photos}}
        <div class="photos section">
          {{#each photos}}
            <button class="photo" style="background-image:url({{urlSmall}})" aria-label="show photo in viewer"></button>
          {{/each}}
        </div>
      {{/if}}
      {{#if reviews}}
        <div class="reviews section">
          <p class="attribution">Reseñas de usuarios de Google</p>
          {{#each reviews}}
            <div class="review">
              <a class="reviewer-identity" href="{{author_url}}" target="_blank">
                <div class="reviewer-avatar" style="background-image:url({{profile_photo_url}})"></div>
                <div class="reviewer-name">{{author_name}}</div>
              </a>
              <div class="rating info">
                <span>
                  {{#each fullStarIcons}}
                    <img src="https://fonts.gstatic.com/s/i/googlematerialicons/star/v15/24px.svg" alt="full star" class="star-icon"/>
                  {{/each}}
                  {{#each halfStarIcons}}
                    <img src="https://fonts.gstatic.com/s/i/googlematerialicons/star_half/v17/24px.svg" alt="half star" class="star-icon"/>
                  {{/each}}
                  {{#each emptyStarIcons}}
                    <img src="https://fonts.gstatic.com/s/i/googlematerialicons/star_outline/v9/24px.svg" alt="empty star" class="star-icon"/>
                  {{/each}}
                </span>
                <span class="review-time">{{relative_time_description}}</span>
              </div>
              <div class="info">{{text}}</div>
            </div>
          {{/each}}
        </div>
      {{/if}}
      {{#if html_attributions}}
        <div class="section">
          {{#each html_attributions}}
            <p class="attribution">{{{this}}}</p>
          {{/each}}
        </div>
      {{/if}}`
}

function getNeighborhoodDiscoveryCode(): string {
  return `
    'use strict';

    function hideElement(el, focusEl) {
      el.style.display = 'none';
      if (focusEl) focusEl.focus();
    }

    function showElement(el, focusEl) {
      el.style.display = 'block';
      if (focusEl) focusEl.focus();
    }

    function hasHiddenContent(el) {
      const noscroll = window.getComputedStyle(el).overflowY.includes('hidden');
      return noscroll && el.scrollHeight > el.clientHeight;
    }

    function formatPlaceType(str) {
      const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
      return capitalized.replace(/_/g, ' ');
    }

    function initArray(arraySize) {
      const array = [];
      while (array.length < arraySize) {
        array.push(0);
      }
      return array;
    }

    function addStarIcons(obj) {
      if (!obj.rating) return;
      const starsOutOfTen = Math.round(2 * obj.rating);
      const fullStars = Math.floor(starsOutOfTen / 2);
      const halfStars = fullStars !== starsOutOfTen / 2 ? 1 : 0;
      const emptyStars = 5 - fullStars - halfStars;
      obj.fullStarIcons = initArray(fullStars);
      obj.halfStarIcons = initArray(halfStars);
      obj.emptyStarIcons = initArray(emptyStars);
    }

    function parseDaysHours(openingHours) {
      const daysHours = openingHours.weekday_text.map((e) => e.split(/\:\s+/))
                .map((e) => ({'days': e[0].substr(0, 3), 'hours': e[1]}));
      for (let i = 1; i < daysHours.length; i++) {
        if (daysHours[i - 1].hours === daysHours[i].hours) {
          if (daysHours[i - 1].days.indexOf('-') !== -1) {
            daysHours[i - 1].days =
                daysHours[i - 1].days.replace(/\w+$/, daysHours[i].days);
          } else {
            daysHours[i - 1].days += ' - ' + daysHours[i].days;
          }
          daysHours.splice(i--, 1);
        }
      }
      return daysHours;
    }

    const ND_NUM_PLACES_INITIAL = 5;
    const ND_NUM_PLACES_SHOW_MORE = 5;
    const ND_NUM_PLACE_PHOTOS_MAX = 6;
    const ND_DEFAULT_POI_MIN_ZOOM = 18;

    const ND_MARKER_ICONS_BY_TYPE = {
      '_default': 'circle',
      'restaurant': 'restaurant',
      'bar': 'local_bar',
      'supermarket': 'local_grocery_store',
      'primary_school': 'school',
      'secondary_school': 'school',
      'atm': 'atm',
    };

    function NeighborhoodDiscovery(configuration) {
      const widget = this;
      const widgetEl = document.querySelector('.neighborhood-discovery');
      widget.center = configuration.mapOptions.center;
      widget.places = configuration.pois || [];

      function initializeMap() {
        const mapOptions = configuration.mapOptions;
        widget.mapBounds = new google.maps.Circle(
          {center: widget.center, radius: configuration.mapRadius}).getBounds();
        mapOptions.restriction = {latLngBounds: widget.mapBounds};
        mapOptions.mapTypeControlOptions = {position: google.maps.ControlPosition.TOP_RIGHT};
        widget.map = new google.maps.Map(widgetEl.querySelector('.map'), mapOptions);
        widget.map.fitBounds(widget.mapBounds, 0);
        widget.map.addListener('click', (e) => {
          if (e.placeId) {
            e.stop();
            widget.selectPlaceById(e.placeId);
          }
        });
        widget.map.addListener('zoom_changed', () => {
          const hideDefaultPoiPins = widget.map.getZoom() < ND_DEFAULT_POI_MIN_ZOOM;
          widget.map.setOptions({
            styles: [{
              featureType: 'poi',
              elementType: hideDefaultPoiPins ? 'labels' : 'labels.text',
              stylers: [{visibility: 'off'}],
            }],
          });
        });

        const markerPath = widgetEl.querySelector('.marker-pin path').getAttribute('d');
        const drawMarker = function(title, position, fillColor, strokeColor, labelText) {
          return new google.maps.Marker({
            title: title,
            position: position,
            map: widget.map,
            icon: {
              path: markerPath,
              fillColor: fillColor,
              fillOpacity: 1,
              strokeColor: strokeColor,
              anchor: new google.maps.Point(13, 35),
              labelOrigin: new google.maps.Point(13, 13),
            },
            label: {
              text: labelText,
              color: 'white',
              fontSize: '16px',
              fontFamily: 'Material Icons',
            },
          });
        };

        if (configuration.centerMarker && configuration.centerMarker.icon) {
          drawMarker('Home', widget.center,
                     '#1A73E8', '#185ABC', configuration.centerMarker.icon);
        }

        widget.addPlaceMarker = function(place) {
          place.marker = drawMarker(place.name, place.coords, '#EA4335', '#C5221F', place.icon);
          place.marker.addListener('click', () => void widget.selectPlaceById(place.placeId));
        };

        widget.updateBounds = function(places) {
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(widget.center);
          for (let place of places) {
            bounds.extend(place.marker.getPosition());
          }
          widget.map.fitBounds(bounds, 100);
        };

        widget.selectedPlaceMarker = new google.maps.Marker({title: 'Point of Interest'});
      }

      function initializePlaceDetails() {
        const detailsService = new google.maps.places.PlacesService(widget.map);
        const placeIdsToDetails = new Map();

        for (let place of widget.places) {
          placeIdsToDetails.set(place.placeId, place);
          place.fetchedFields = new Set(['place_id']);
        }

        widget.fetchPlaceDetails = function(placeId, fields, callback) {
          if (!placeId || !fields) return;
          let place = placeIdsToDetails.get(placeId);
          if (!place) {
            place = {placeId: placeId, fetchedFields: new Set(['place_id'])};
            placeIdsToDetails.set(placeId, place);
          }
          const missingFields = fields.filter((field) => !place.fetchedFields.has(field));
          if (missingFields.length === 0) {
            callback(place);
            return;
          }

          const request = {placeId: placeId, fields: missingFields};
          let retryCount = 0;
          const processResult = function(result, status) {
            if (status !== google.maps.places.PlacesServiceStatus.OK) {
              if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT &&
                  retryCount < 5) {
                const delay = (Math.pow(2, retryCount) + Math.random()) * 500;
                setTimeout(() => void detailsService.getDetails(request, processResult), delay);
                retryCount++;
              }
              return;
            }

            if (result.name) place.name = result.name;
            if (result.geometry) place.coords = result.geometry.location;
            if (result.formatted_address) place.address = result.formatted_address;
            if (result.photos) {
              place.photos = result.photos.map((photo) => ({
                urlSmall: photo.getUrl({maxWidth: 200, maxHeight: 200}),
                urlLarge: photo.getUrl({maxWidth: 1200, maxHeight: 1200}),
                attrs: photo.html_attributions,
              })).slice(0, ND_NUM_PLACE_PHOTOS_MAX);
            }
            if (result.types) {
              place.type = formatPlaceType(result.types[0]);
              place.icon = ND_MARKER_ICONS_BY_TYPE['_default'];
              for (let type of result.types) {
                if (type in ND_MARKER_ICONS_BY_TYPE) {
                  place.type = formatPlaceType(type);
                  place.icon = ND_MARKER_ICONS_BY_TYPE[type];
                  break;
                }
              }
            }
            if (result.url) place.url = result.url;
            if (result.website) {
              place.website = result.website;
              const url = new URL(place.website);
              place.websiteDomain = url.hostname;
            }
            if (result.formatted_phone_number) place.phoneNumber = result.formatted_phone_number;
            if (result.opening_hours) place.openingHours = parseDaysHours(result.opening_hours);
            if (result.rating) {
              place.rating = result.rating;
              addStarIcons(place);
            }
            if (result.user_ratings_total) place.numReviews = result.user_ratings_total;
            if (result.price_level) {
              place.priceLevel = result.price_level;
              place.dollarSigns = initArray(result.price_level);
            }
            if (result.reviews) {
              place.reviews = result.reviews;
              for (let review of place.reviews) {
                addStarIcons(review);
              }
            }

            for (let field of missingFields) {
              place.fetchedFields.add(field);
            }
            callback(place);
          };

          if (widget.placeIdsToAutocompleteResults) {
            const autoCompleteResult = widget.placeIdsToAutocompleteResults.get(placeId);
            if (autoCompleteResult) {
              processResult(autoCompleteResult, google.maps.places.PlacesServiceStatus.OK);
              return;
            }
          }
          detailsService.getDetails(request, processResult);
        };
      }

      function initializeSidePanel() {
        const placesPanelEl = widgetEl.querySelector('.places-panel');
        const detailsPanelEl = widgetEl.querySelector('.details-panel');
        const placeResultsEl = widgetEl.querySelector('.place-results-list');
        const showMoreButtonEl = widgetEl.querySelector('.show-more-button');
        const photoModalEl = widgetEl.querySelector('.photo-modal');
        const detailsTemplate = Handlebars.compile(
            document.getElementById('nd-place-details-tmpl').innerHTML);
        const resultsTemplate = Handlebars.compile(
            document.getElementById('nd-place-results-tmpl').innerHTML);

        const showPhotoModal = function(photo, placeName) {
          const prevFocusEl = document.activeElement;
          const imgEl = photoModalEl.querySelector('img');
          imgEl.src = photo.urlLarge;
          const backButtonEl = photoModalEl.querySelector('.back-button');
          backButtonEl.addEventListener('click', () => {
            hideElement(photoModalEl, prevFocusEl);
            imgEl.src = '';
          });
          photoModalEl.querySelector('.photo-place').innerHTML = placeName;
          photoModalEl.querySelector('.photo-attrs span').innerHTML = photo.attrs;
          const attributionEl = photoModalEl.querySelector('.photo-attrs a');
          if (attributionEl) attributionEl.setAttribute('target', '_blank');
          photoModalEl.addEventListener('click', (e) => {
            if (e.target === photoModalEl) {
              hideElement(photoModalEl, prevFocusEl);
              imgEl.src = '';
            }
          });
          showElement(photoModalEl, backButtonEl);
        };

        let selectedPlaceId;
        widget.selectPlaceById = function(placeId, panToMarker) {
          if (selectedPlaceId === placeId) return;
          selectedPlaceId = placeId;
          const prevFocusEl = document.activeElement;

          const showDetailsPanel = function(place) {
            detailsPanelEl.innerHTML = detailsTemplate(place);
            const backButtonEl = detailsPanelEl.querySelector('.back-button');
            backButtonEl.addEventListener('click', () => {
              hideElement(detailsPanelEl, prevFocusEl);
              selectedPlaceId = undefined;
              widget.updateDirections();
              widget.selectedPlaceMarker.setMap(null);
            });
            detailsPanelEl.querySelectorAll('.photo').forEach((photoEl, i) => {
              photoEl.addEventListener('click', () => {
                showPhotoModal(place.photos[i], place.name);
              });
            });
            showElement(detailsPanelEl, backButtonEl);
            detailsPanelEl.scrollTop = 0;
          };

          const processResult = function(place) {
            if (place.marker) {
              widget.selectedPlaceMarker.setMap(null);
            } else {
              widget.selectedPlaceMarker.setPosition(place.coords);
              widget.selectedPlaceMarker.setMap(widget.map);
            }
            if (panToMarker) {
              widget.map.panTo(place.coords);
            }
            showDetailsPanel(place);
            widget.fetchDuration(place, showDetailsPanel);
            widget.updateDirections(place);
          };

          widget.fetchPlaceDetails(placeId, [
            'name', 'types', 'geometry.location', 'formatted_address', 'photo', 'url',
            'website', 'formatted_phone_number', 'opening_hours',
            'rating', 'user_ratings_total', 'price_level', 'review',
          ], processResult);
        };

        const renderPlaceResults = function(places, startIndex) {
          placeResultsEl.insertAdjacentHTML('beforeend', resultsTemplate({places: places}));
          placeResultsEl.querySelectorAll('.place-result').forEach((resultEl, i) => {
            const place = places[i - startIndex];
            if (!place) return;
            resultEl.addEventListener('click', () => {
              widget.selectPlaceById(place.placeId, true);
            });
            resultEl.querySelector('.name').addEventListener('click', (e) => {
              widget.selectPlaceById(place.placeId, true);
              e.stopPropagation();
            });
            resultEl.querySelector('.photo').addEventListener('click', (e) => {
              showPhotoModal(place.photos[0], place.name);
              e.stopPropagation();
            });
            widget.addPlaceMarker(place);
          });
        };

        let nextPlaceIndex = 0;

        const showNextPlaces = function(n) {
          const nextPlaces = widget.places.slice(nextPlaceIndex, nextPlaceIndex + n);
          if (nextPlaces.length < 1) {
            hideElement(showMoreButtonEl);
            return;
          }
          showMoreButtonEl.disabled = true;
          let count = nextPlaces.length;
          for (let place of nextPlaces) {
            const processResult = function(place) {
              count--;
              if (count > 0) return;
              renderPlaceResults(nextPlaces, nextPlaceIndex);
              nextPlaceIndex += n;
              widget.updateBounds(widget.places.slice(0, nextPlaceIndex));
              const hasMorePlacesToShow = nextPlaceIndex < widget.places.length;
              if (hasMorePlacesToShow || hasHiddenContent(placesPanelEl)) {
                showElement(showMoreButtonEl);
                showMoreButtonEl.disabled = false;
              } else {
                hideElement(showMoreButtonEl);
              }
            };
            widget.fetchPlaceDetails(place.placeId, [
              'name', 'types', 'geometry.location',
              'photo',
              'rating', 'user_ratings_total', 'price_level',
            ], processResult);
          }
        };
        showNextPlaces(ND_NUM_PLACES_INITIAL);

        showMoreButtonEl.addEventListener('click', () => {
          placesPanelEl.classList.remove('no-scroll');
          showMoreButtonEl.classList.remove('sticky');
          showNextPlaces(ND_NUM_PLACES_SHOW_MORE);
        });
      }

      function initializeSearchInput() {
        const searchInputEl = widgetEl.querySelector('.place-search-input');
        widget.placeIdsToAutocompleteResults = new Map();

        const autocomplete = new google.maps.places.Autocomplete(searchInputEl, {
          types: ['establishment'],
          fields: [
            'place_id', 'name', 'types', 'geometry.location', 'formatted_address', 'photo', 'url',
            'website', 'formatted_phone_number', 'opening_hours',
            'rating', 'user_ratings_total', 'price_level', 'review',
          ],
          bounds: widget.mapBounds,
          strictBounds: true,
        });
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          widget.placeIdsToAutocompleteResults.set(place.place_id, place);
          widget.selectPlaceById(place.place_id, true);
          searchInputEl.value = '';
        });
      }

      function initializeDistanceMatrix() {
        const distanceMatrixService = new google.maps.DistanceMatrixService();

        widget.fetchDuration = function(place, callback) {
          if (!widget.center || !place || !place.coords || place.duration) return;
          const request = {
            origins: [widget.center],
            destinations: [place.coords],
            travelMode: google.maps.TravelMode.DRIVING,
          };
          distanceMatrixService.getDistanceMatrix(request, function(result, status) {
            if (status === google.maps.DistanceMatrixStatus.OK) {
              const trip = result.rows[0].elements[0];
              if (trip.status === google.maps.DistanceMatrixElementStatus.OK) {
                place.duration = trip.duration;
                callback(place);
              }
            }
          });
        };
      }

      function initializeDirections() {
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
          suppressMarkers: true,
          preserveViewport: true,
        });

        widget.updateDirections = function(place) {
          if (!widget.center || !place || !place.coords) {
            directionsRenderer.setMap(null);
            return;
          }
          if (place.directions) {
            directionsRenderer.setMap(widget.map);
            directionsRenderer.setDirections(place.directions);
            return;
          }
          const request = {
            origin: widget.center,
            destination: place.coords,
            travelMode: google.maps.TravelMode.DRIVING,
          };
          directionsService.route(request, function(result, status) {
            if (status === google.maps.DirectionsStatus.OK) {
              place.directions = result;
              directionsRenderer.setMap(widget.map);
              directionsRenderer.setDirections(result);
            }
          });
        };
      }

      initializeMap();
      initializePlaceDetails();
      initializeSidePanel();
      initializeSearchInput();
      initializeDistanceMatrix();
      initializeDirections();
    }

    window.NeighborhoodDiscovery = NeighborhoodDiscovery;
    
    // initMap will be called by Google Maps API
    // We'll initialize the widget in the onLoad callback instead
    if (!window.initMap) {
      window.initMap = function() {
        // This is called by Google Maps API
        // The actual initialization happens in the component's onLoad callback
        console.log("Google Maps API callback called");
      };
    }
  `
}
