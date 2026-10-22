// One URI collision contract for Studio and the controlled publisher, including legacy English documents.
export const slugCollisionQuery=`count(*[_type == "article" && !(_id in [$publishedId, $draftId]) && !(_id in path("versions.**")) && (translations[$localeKey].slug.current == $slug || ($localeKey == "en" && !defined(translations) && slug.current == $slug))])`;
