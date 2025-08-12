// import React from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import styles from './profileCard.module.css';

// const ProfileCard = ({ item }) => {
//     // Determine which image to use

//     // Function to strip HTML tags and clean text
//     const stripHtmlAndClean = (html) => {
//         if (!html) return 
        
//         // Remove HTML tags
//         const withoutTags = html.replace(/<[^>]*>/g, '');
        
//         // Decode HTML entities (like &amp; &lt; &gt; etc.)
//         const withoutEntities = withoutTags
//             .replace(/&amp;/g, '&')
//             .replace(/&lt;/g, '<')
//             .replace(/&gt;/g, '>')
//             .replace(/&quot;/g, '"')
//             .replace(/&#x27;/g, "'")
//             .replace(/&nbsp;/g, ' ');
        
//         // Remove extra whitespace and line breaks
//         const cleaned = withoutEntities
//             .replace(/\s+/g, ' ')
//             .trim();
        
//         return cleaned;
//     };
    
//     // Clean the description
//     const cleanDescription = stripHtmlAndClean(item.desc);
//     const imageUrl = (item.img && item.img.trim() !== '') ? item.img : '/p1.jpeg';
    
//     return (
//         <div className={styles.container}>
            
//                 {item.img &&(
//                     <div className={styles.imageContainer}>
//                         <Image src={item.img} alt="" fill className={styles.image}/>
//                     </div>
//                 )}
            
//             <div className={styles.textContainer}>
//                 <div className={styles.detail}>
//                     <Link href={`/posts/${item.slug}`}>
//                         <h1>{item.title}</h1>
//                     </Link>
//                     <span className={styles.date}> {item.createdAt?.substring(0,10)}  -</span>
//                     <span className={styles.category}>{item.catSlug}</span>
                

                    
//                 </div>

//                 <p className={styles.desc}>
//                     {cleanDescription.substring(0,60)}
//                 </p>

//                 <Link href={`/posts/${item.slug}`} className={styles.link}>Read More</Link>
//             </div>
//         </div>
//     );
// }

// export default ProfileCard;