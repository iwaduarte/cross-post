# Cross Post

[![GitHub license](https://img.shields.io/github/license/iwaduarte/cross-post)](./LICENSE) ![npm version](https://img.shields.io/npm/v/crossposting)

Cross posting done right. Publish your article like a boss to Medium, Hashnode, and dev.to

## Installation
In your terminal:
```bash
npm i -g crossposting
```

## Configuration
Adding keys for publishing it:
```bash 
# [platform]: dev | hashnode | medium
# crosspost [command] - can also be used
cpt setk [platform]
```
more info: [Obtaining key from dev.to | medium | hashnode](#configure-authorization)

## Usage
`url|path` is the URL or the path to your article. It can either upload from a website like medium.com or from your local folder.
```bash
cpt <url|path> [options]
```
[See  more info about options](#options)

## Recommended usage
You can set title, tags, canonicalUrl, mainImage from the **command line**, from the **frontmatter** inside your markdown files, or you can leave to **us** (we will try our best). We recommend that you get used to adding frontmatter to your .md files when writing:

```yaml
# post.md

# frontmatter section
---
title: The best author
canonical: https://originalsitepublished.com
main_image: sameAsImageUrlInCli.jpg
tags:
   - life
   - amazing 
   - great
---
```
And then inside the folder you would just:

```bash
cpt post.md 
```
_It is that easy!_

## I do not have .md files, can I still publish
Definitely you can. Crossposting was created to be used in scenarios where you already have your articles out there. For that use like that:

```
cpt https://www.article.com/all-good -t Life Good  -i ./image.png -tags life amazing  
```
We will assume the url above as the canonical one.

## It is a original article ( I have not publish anywhere) can I still use the tool to publish ?
Sure you can. Just remove the canonical url info from you .md files and you are set to go.

```bash
cpt post.md 
```

To even more customization cross post your articles, you will use the following command:

## Options
1. `-p, --platforms [platforms...]` The platform(s) you want to post the article on. By default: **all platforms** with a **KEY** token set.
    ```bash
    cross-post <url> -p dev hashnode
    ```
2. `-t, --title [title]` The title by default will be taken from the URL you supplied, however, if you want to use a different title you can supply it in this option.
3. `-cnu, --canonical-url [canonicalUrl]` Original url the article was published first. It is mandatory for SEO
4. `-pu, --public` by default, the article will be posted as a draft (or hidden for hashnode due to the limitations of the Hashnode API). You can pass this option to post it publicly.
5. `-i, --ignore-image` this will ignore uploading an image with the article. This helps avoid errors when an image cannot be fetched.
6. `-is, --image-selector [imageSelector]` this will select the image from the page based on the selector you provide, instead of the first image inside the article. This option overrides the default image selector in the configurations.
7. `-iu, --image-url [imageUrl]` this will use the image URL you provide as a value of the option and will not look for any image inside the article.
8. `-ts, --title-selector [titleSelector]` this will select the title from the page based on the selector you provide, instead of the first heading inside the article. This option overrides the default title selector in the configurations.


# Configure Authorization

**The tokens are only saved inside your computer.**

### dev.to

1. After logging into your account on dev.to.
2. Go to https://dev.to/settings/extensions#api
3. Generate API Key
   ```bash
   cross-post setk dev
   ```
### hashnode.com

1. After logging into your account on dev.to.
2. Go to https://hashnode.com/settings/developer
3. Generate new token
   ```bash
   cross-post setk hashnode
   ```

### medium.com

1. After logging into your account on dev.to.
2. Go to https://medium.com/me/settings/security
3. Integration tokens (end of the page)
4. Get token
   ```bash
    cross-post setk medium
   ```
   
## Motivations

This repository initially started as a fork of the crosspost project. Over time, it became apparent that the codebase needed to diverge significantly to meet our unique set of requirements and to optimize for performance, maintainability, and scalability.

### Key Changes
1. **Refactoring for Performance:** Extensive refactoring has been carried out to make the codebase leaner, more efficient, and significantly faster.
2. **Modular Design:** The code has been restructured into a more modular design to make it easier for other developers to understand, contribute to, and maintain.
3. **Improved Documentation:** Comprehensive documentation has been added, making it easier for new developers to get started and for users to understand the project's capabilities.
4. **Automated Workflows:** Integration with CI/CD pipelines like GitHub Actions has been established for automated deployment, ensuring that the code in the main branch is always deployable.

Due to the extensive changes and the divergent paths of the original cross-post-blog and this repository, it became necessary to detach and establish this as a standalone repository. This allows for more focused development and issue tracking tailored specifically to the features and architecture of this project.

## Contribute
We are open to contributions and actively seeking collaborators who are interested in making this project even better. If you encounter any issues or have feature requests, please feel free to open an issue or submit a pull request.


## License
MIT
