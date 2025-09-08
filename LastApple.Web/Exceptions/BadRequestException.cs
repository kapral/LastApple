using System.Net;

namespace LastApple.Web.Exceptions;

public class BadRequestException(string message = "The request was invalid.") 
    : HttpException(message, HttpStatusCode.BadRequest)
{
}