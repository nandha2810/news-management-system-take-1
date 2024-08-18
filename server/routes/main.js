const express = require("express");
const router = express.Router();
const Post = require("../model/Post");

/**
 * GET/
 * home
 */
router.get("/", async (req, res) => {
  const locals = {
    title: "Daily News",
    description: "New Management System Project",
  };
  try {
    let perPage = 5;
    let page = req.query.page || 1;
    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
    const count = await Post.countDocuments();
    // console.log(count);
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);
    res.render("index", {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
    });
  } catch (error) {
    console.log(error);
  }
});

/**
 * GET/
 * post:id
 */
router.get("/post/:id", async (req, res) => {
  try {
    let slug = req.params.id;
    const data = await Post.findById({ _id: slug });
    const locals = {
      title: data.title,
      description: "New Management System Project",
    };
    res.render("post", { locals, data });
  } catch (error) {
    console.log(error);
  }
});

/**
 * POST/
 * Post - searchTerm
 */
router.post("/search", async (req, res) => {
  try {
    const locals = {
      title: "Search",
      description: "New Management System Project",
    };
    let searchTerm = req.body.searchTerm;
    // console.log(searchTerm);
    let searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, "i") } },
        { body: { $regex: new RegExp(searchNoSpecialChar, "i") } },
      ],
    });
    res.render("search", {
      data,
      locals,
    });
  } catch (error) {
    console.log(error);
  }
});

// const insertPostData = () => {
//   Post.insertMany([
//     {
//       title: "Quentin Tarantino Drops ‘The Movie Critic’ As His Final Film",
//       body: "Quentin Tarantino’s movies are always full of surprises, and here is one about The Movie Critic we did not expect. Deadline can reveal that Tarantino has dropped the film as his 10th and final project. He simply changed his mind, Deadline has been told.Tarantino was going to have Brad Pitt as the principal star, which would have marked their third teaming after Inglourious Basterds and Once Upon a Time in Hollywood. There were rumors that many from the casts of his past films might take part, and Sony was preparing to make the film after doing such a superb job on the last one.",
//     },
//     {
//       title:
//         "Scorsese Eyes Frank Sinatra Biopic With Leonardo DiCaprio and Jennifer Lawrence.",
//       body: "After landing 10 Oscar nominations for last year’s historical crime epic “Killers of the Flower Moon,” the 81-year-old director has mapped out his next several projects. Sources say he plans to shoot two films back to back: the first about Jesus, the second a Frank Sinatra biopic.",
//     },
//     {
//       title: 'After "Oppenheimer"',
//       body: 'Christopher Nolan is most likely to focus on the mystery-thriller "The Prisoner", based on the 1960s TV series created by and starring Patrick McGoohan. Nolan was attached to this project in 2009 and now may direct it.',
//     },
//     {
//       title: "Park Chan-wook to Begin Shooting Violent Comedy-Thriller ",
//       body: "Korean film maestro Park Chan-wook is keeping in motion. The internationally acclaimed auteur, 60, will begin production Saturday on his 12th feature, an adaptation of American novelist Donald Westlake’s 1996 novel The Ax. The movie, which is currently going by the working title I Can’t Help It.",
//     },
//     {
//       title: "‘Parasite’ makes Oscars.",
//       body: "Parasite makes Oscars history with four wins, including stunning best picture victory",
//     },
//   ]);
// };
// insertPostData();

router.get("/about", (req, res) => {
  res.render("about");
});

module.exports = router;

//! sample of home route
// router.get("/", async (req, res) => {
//   const locals = {
//     title: "Daily News",
//     description: "New Management System Project",
//   };
//   try {
//     const data = await Post.find();
//     res.render("index", { locals, data });
//   } catch (error) {
//     console.log(error);
//   }
// });
