module.exports = async function (fastify) {
  fastify.get('/Ideas', async function (req, reply) {
    try {
      const ideasCollection = fastify.mongo.GameInfo.db.collection("Ideas");
      const votesCollection = fastify.mongo.GameInfo.db.collection("IdeaVotes");

      const authHeader = req.headers['authorization'];
      let userId = null;

      if (authHeader && authHeader.replace(/^bearer\s+/i, '').trim()) {
        try {
          const token = authHeader.replace(/^bearer\s+/i, '').trim();
          const decoded = fastify.jwt.decode(token);

          if (decoded && decoded._id) {
            userId = decoded._id;
          }
        } catch (err) {
          console.warn('Invalid token. Ignoring user context.');
        }
      }

      const aggregationPipeline = [
        {
          $lookup: {
            from: "IdeaVotes",
            localField: "_id",
            foreignField: "ideaId",
            as: "votes"
          }
        },
        {
          $addFields: {
            VoteAmount: { $size: "$votes" },
            VoteValue: {
              $sum: "$votes.vote"
            }
          }
        },
        {
          $project: {
            votes: 0
          }
        }
      ];

      const ideas = await ideasCollection.aggregate(aggregationPipeline).toArray();

      if (userId) {
        const userVotes = await votesCollection.find({
          userId: new fastify.mongo.ObjectId(userId)
        }).toArray();

        const voteMap = {};
        userVotes.forEach(vote => {
          voteMap[vote.ideaId.toString()] = vote.vote;
        });

        const ideasWithVotes = ideas.map(idea => ({
          ...idea,
          CurrentUserVote: voteMap[idea._id.toString()] ?? null
        }));

        return reply.status(200).send(ideasWithVotes);
      }

      return reply.status(200).send(ideas);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.get('/Idea/:titleId', async function (req, reply) {
    try {
      const ideaId = req.params.titleId;

      if (!ideaId) {
        return reply.status(400).send({ error: 'Invalid request: idea ID is required' });
      }

      const db = fastify.mongo.GameInfo.db;
      const ideasCollection = db.collection("Ideas");
      const votesCollection = db.collection("IdeaVotes");

      const ideaObjectId = new fastify.mongo.ObjectId(ideaId);

      let userId = null;

      const token = req.headers['authorization']?.replace(/^bearer\s+/i, '').trim();
      if (token) {
        userId = fastify.jwt.decode(token)._id;
      }

      const ideaAggregation = await ideasCollection.aggregate([
        { $match: { _id: ideaObjectId } },
        {
          $lookup: {
            from: "IdeaVotes",
            localField: "_id",
            foreignField: "ideaId",
            as: "votes"
          }
        },
        {
          $addFields: {
            VoteAmount: { $size: "$votes" },
            VoteValue: { $sum: "$votes.vote" }
          }
        },
        {
          $project: {
            votes: 0
          }
        }
      ]).toArray();

      const idea = ideaAggregation[0];

      if (!idea) {
        return reply.status(404).send({ error: 'Idea not found' });
      }

      if (userId) {
        const userVote = await votesCollection.findOne({
          ideaId: ideaObjectId,
          userId: new fastify.mongo.ObjectId(userId)
        });

        idea.CurrentUserVote = userVote?.vote ?? null;
      }

      return reply.status(200).send(idea);
    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.post('/Idea/Vote', { preHandler: fastify.verifyJWT() }, async function (req, reply) {
    try {
      const { ideaId, vote } = req.body;

      if (!ideaId || ![1, -1].includes(vote)) {
        return reply.status(400).send({ err: 'Invalid request' });
      }

      let userId = null;

      const token = req.headers['authorization']?.replace(/^bearer\s+/i, '').trim();
      if (token) {
        userId = fastify.jwt.decode(token)._id;
      }

      const db = fastify.mongo.GameInfo.db;
      const votesCollection = db.collection("IdeaVotes");
      const ideasCollection = db.collection("Ideas");

      const ideaObjectId = new fastify.mongo.ObjectId(ideaId);
      const userObjectId = new fastify.mongo.ObjectId(userId);

      const existingVote = await votesCollection.findOne({
        ideaId: ideaObjectId,
        userId: userObjectId
      });

      let replyData = { msg: '' };
      let newUserVote = vote;

      if (existingVote) {
        if (existingVote.vote !== vote) {
          await votesCollection.updateOne(
            { _id: existingVote._id },
            { $set: { vote: vote, updatedAt: new Date() } }
          );
          replyData.msg = 'Vote updated';
        } else {
          await votesCollection.deleteOne({ _id: existingVote._id });
          replyData.msg = 'Vote removed';
          newUserVote = null;
        }
      } else {
        await votesCollection.insertOne({
          ideaId: ideaObjectId,
          userId: userObjectId,
          vote: vote,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        replyData.msg = 'Vote registered';
      }

      const aggregatedIdeas = await ideasCollection.aggregate([
        { $match: { _id: ideaObjectId } },
        {
          $lookup: {
            from: "IdeaVotes",
            localField: "_id",
            foreignField: "ideaId",
            as: "votes"
          }
        },
        {
          $addFields: {
            VoteAmount: { $size: "$votes" },
            VoteValue: {
              $sum: "$votes.vote"
            }
          }
        },
        {
          $project: {
            votes: 0
          }
        }
      ]).toArray();

      const updatedIdea = aggregatedIdeas[0];

      if (updatedIdea) {
        updatedIdea.CurrentUserVote = newUserVote;
        replyData.updatedIdea = updatedIdea;
      }

      return reply.status(200).send(replyData);

    } catch (err) {
      console.error(err);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}