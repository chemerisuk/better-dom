HTML strings are boring and complex, they take a lot of space. Let's fix that with [emmet](http://emmet.io/):

```
{nav}{ul}{li}{/li}{/ul}{/nav} -> nav>ul>li
{form id="search" class="wide"}{/form} -> form#search.wide
{ul}{li class="item1"}{/li}{li class="item2"}{/li}{li class="item3"}{/li}{/ul} -> ul>li.item$*3
```

Because of code size emmet expressions support is only for HTML strings for now. Take a look at the [emmet cheat sheet](http://docs.emmet.io/cheat-sheet/) for more examples.

__Do not use the expressions for complex templates!__ Several recommendations from the [emmet docs](http://docs.emmet.io/):

> * Abbreviations are not a template language, they don’t have to be “readable”, they have to be “quickly expandable and removable”.
> * You don’t really need to write complex abbreviations. Stop thinking that “typing” is the slowest process in web-development. You’ll quickly find out that constructing a single complex abbreviation is much slower and error-prone than constructing and typing a few short ones.
