import { json } from "@sveltejs/kit";
import dirTree from "directory-tree";
import * as fs from "fs";

let baseRoute = "/";
let routes = [baseRoute];
let date = new Date().toISOString().split("T")[0];

function getSitemapXML(domain: string, routes: string[]) {
  let sitemap = "";
  sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  routes.forEach((route) => {
    sitemap += getSitemapUrl(domain + route);
  });
  sitemap += "\n</urlset>";
  return sitemap;
}
function getSitemapUrl(location: string) {
  let url =
    "<url>\n" +
    `<loc>${location}</loc>\n` +
    `<lastmod>${date}</lastmod>\n` +
    "</url>";
  return url;
}

function getEndpoints(tree: dirTree.DirectoryTree, route: string) {
  tree.children!.forEach((child) => {
    if (child.children != undefined && child.children.length != 0) {
      let childRoute = route + child.name;
      if (child.children.some((e) => e.name === "+page.svelte")) {
        routes.push(childRoute);
      }
      getEndpoints(child, childRoute + "/");
    }
  });
}

export async function GET(event: any) {
  // every request will generate a new sitemap.xml
  // if you want to cache the sitemap.xml you can use a cron job to generate the sitemap.xml
  // and save it in the public folder
  let sitemap = "";
  let domain = "http://localhost:5173";
  let tree = dirTree("src/routes");
  routes = [baseRoute];

  getEndpoints(tree, baseRoute);

  console.log("baseRoute", baseRoute);
  console.log("routes", routes);
  sitemap = getSitemapXML(domain, routes);

  fs.writeFileSync("static/sitemap.xml", sitemap);

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}

// let sitemap = "";
// const tree = dirTree("./src/routes")

// getEndpoints(tree, baseRoute);

// // YOUR_DOMAIN should be like https://example.com
// const DOMAIN = "http://localhost:5173"
// sitemap = getSitemapXML(DOMAIN, routes)

// // If you use the script in postbuild mode use
// // For vercel deployment use:
// //fs.writeFileSync('.vercel/output/static/sitemap.xml', sitemap);
// fs.writeFileSync('static/sitemap.xml', sitemap);

// // If you use the script in prebuild mode use
// //fs.writeFileSync('static/sitemap.xml', sitemap);
// // ... endpoint logic
// // return json({
// //     foo: 'bar'
// // });
// // return sitemap xml
// return new Response(sitemap, {
//     headers: {
//         "Content-Type": "application/xml"
//     }
// })
