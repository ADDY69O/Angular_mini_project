import { Injectable } from "@angular/core";
import ApiService, {APIResponse} from "../services/api.service"

export type PostResponse = {
    id:number,
    title:string,
    body:string,
    tags:string[],
    reactions:{
        likes:number,
        dislikes:number
    },
    views:number,
    userId:number
}

export type ProductResponse = {
  posts: PostResponse[];
  total: number;
  skip: number;
  limit: number;
};


@Injectable({
    providedIn: 'root', // This ensures the service is provided at the root level
  })

  export class PostsService extends ApiService {
    async getPost(skip: number, limit: number) {
      return this.get<ProductResponse>(`posts?limit=${limit}&skip=${skip}`)
        .then(response => {
          console.log('API response:', response); // Log the response to inspect its structure
  
          
            return response; // Return the response directly if it matches the expected structure
          
          // If the response is not in expected format
        })
        .catch(error => {
          console.error('Error fetching posts:', error);
          throw error; // Rethrow the error after logging
        });
    }
  }

