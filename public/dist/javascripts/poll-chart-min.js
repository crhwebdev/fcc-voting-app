"use strict";var chartjs=function(t){function a(t){var a=n(6);t.data.labels=a.labels,t.data.datasets.forEach(function(t){t.data=a.data}),t.update()}function e(){document.getElementsByClassName("option-name"),document.getElementsByClassName("option-count");var t=n(6);return new Chart(l,{type:"pie",data:{labels:t.labels,datasets:[{label:"# of Votes",data:t.data,backgroundColor:["rgba(255, 99, 132, 0.8)","rgba(54, 162, 235, 0.8)","rgba(255, 206, 86, 0.8)","rgba(75, 192, 192, 0.8)","rgba(153, 102, 255, 0.8)","rgba(255, 159, 64, 0.8)"],borderColor:["rgba(255,99,132,1)","rgba(54, 162, 235, 1)","rgba(255, 206, 86, 1)","rgba(75, 192, 192, 1)","rgba(153, 102, 255, 1)","rgba(255, 159, 64, 1)"],borderWidth:1}]},options:{responsive:!0,maintainAspectRatio:!0}})}function n(t){return o(r(document.getElementsByClassName("option-name"),document.getElementsByClassName("option-count")),t)}function r(t,a){for(var e=Array.prototype.map.call(t,function(t){return t.textContent}),n=Array.prototype.map.call(a,function(t){return+t.textContent}),r=[],o=0;o<e.length;o++){var l=Object.create(null);l.label=e[o],l.data=n[o],r.push(l)}return r.sort(function(t,a){return a.data-t.data}),r}function o(t,a){a||(a=t.length);for(var e=a-1,n=0,r=[],o=[],l=0;l<t.length;l++)l<e?(r.push(t[l].label),o.push(t[l].data)):n+=t[l].data;return r.push("other"),o.push(n),{labels:r,data:o}}var l=document.getElementById("myChart").getContext("2d"),s={};return s.draw=e,s.update=a,s}("undefined"!=typeof self&&self);