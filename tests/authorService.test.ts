import app from "../server";
import request from "supertest";
import Book from "../models/book";
import mongoose from "mongoose";
import BookInstance from "../models/bookinstance";
import Author from "../models/author";

describe("Verify GET /authors", () => {
    const mockAuthors = [
        {name: "a, b", lifespan: "1900 - 2000"},
        {name: "c, d", lifespan: "1905 - 2010"},
        {name: "e, f", lifespan: "1980 - 2020"},
    ];

    let consoleSpy: jest.SpyInstance;

    beforeAll(() => {
        consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterAll(() => {
        consoleSpy.mockRestore();
    });

    it("should respond with a mesage when the database has no authors", async () => {
        Author.getAllAuthors = jest.fn().mockResolvedValue([]);
        const response = await request(app).get("/authors");
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("No authors found");
    });

    it("should respond with a list of author names and lifetimes sorted by family name of the authors", async () => {
        const expextedSortedAuthors = [...mockAuthors].sort((a,b) => a.name.localeCompare(b.name))
        Author.getAllAuthors = jest.fn().mockImplementationOnce((sortOpts) => {
            if (sortOpts && sortOpts.family_name == 1) {
                return Promise.resolve(expextedSortedAuthors)
            }
            return Promise.resolve(mockAuthors);
        });
        const response = await request(app).get("/authors");
        expect(response.statusCode).toBe(200);
        expect(expextedSortedAuthors).toStrictEqual(response.body)
    });

    it("should respond with an error message when there is an error message when there is an error processing", async () => {
        Author.getAllAuthors = jest.fn().mockRejectedValue(new Error("Datebase error"))
        const response = await request(app).get("/authors");
        expect(response.statusCode).toBe(500);
        expect(consoleSpy).toHaveBeenCalled();
    })

});